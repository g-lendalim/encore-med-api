import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { Role, User, RefreshToken } from '@prisma/client';

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

type Expiry = string | number;

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpires: Expiry;
  private readonly refreshExpires: Expiry;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret =
      this.configService.get<string>('JWT_SECRET') ?? 'dev_access_secret';
    this.refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'dev_refresh_secret';
    this.accessExpires =
      this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN') ?? '1h';
    this.refreshExpires =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') ?? '30d';
  }

  async register(email: string, password: string, role: Role = 'PATIENT') {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, role },
    });

    return {
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    await this.saveRefreshToken(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });

      const userId = payload?.sub;
      if (!userId) throw new UnauthorizedException('Invalid refresh token');

      const tokens = await this.prisma.refreshToken.findMany({
        where: { userId, expiresAt: { gt: new Date() } },
      });

      let matchedToken: RefreshToken | null = null;
      for (const t of tokens) {
        const matched = await bcrypt.compare(refreshToken, t.tokenHash);
        if (matched) {
          matchedToken = t;
          break;
        }
      }

      if (!matchedToken)
        throw new UnauthorizedException('Refresh token not recognized');

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new UnauthorizedException('User not found');

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.generateAccessToken(user),
        this.generateRefreshToken(user),
      ]);

      await this.saveRefreshToken(user.id, newRefreshToken);
      await this.prisma.refreshToken.delete({ where: { id: matchedToken.id } });

      return { access_token: newAccessToken, refresh_token: newRefreshToken };
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Refresh failed:', err.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });

      const userId = payload?.sub;
      if (!userId) return { message: 'Logged out' };

      const tokens = await this.prisma.refreshToken.findMany({
        where: { userId },
      });
      for (const t of tokens) {
        if (await bcrypt.compare(refreshToken, t.tokenHash)) {
          await this.prisma.refreshToken.delete({ where: { id: t.id } });
          return { message: 'Logged out' };
        }
      }
      return { message: 'Logged out' };
    } catch (err: unknown) {
      if (err instanceof Error) console.warn('Logout error:', err.message);
      return { message: 'Logged out' };
    }
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpires as number,
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpires as number,
    });
  }

  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<RefreshToken> {
    const hash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(
      Date.now() + this.parseDurationToMs(String(this.refreshExpires)),
    );
    return this.prisma.refreshToken.create({
      data: { tokenHash: hash, userId, expiresAt },
    });
  }

  private parseDurationToMs(duration: string): number {
    const match = /^(\d+)(d|h|m|s)$/.exec(duration);
    if (!match) return 30 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      case 's':
        return value * 1000;
      default:
        return 30 * 24 * 60 * 60 * 1000;
    }
  }
}
