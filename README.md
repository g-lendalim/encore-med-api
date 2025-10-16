<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" /></a>
</p>

# Encore Med Backend

A **hospital appointment management system** built with **NestJS, TypeScript, and PostgreSQL**.

This backend handles **multi-hospital appointment scheduling**, staff and patient management, doctor schedules, timezone-aware operations, and automated email notifications.

---

## Table of Contents

* [Features](#features)
* [Architecture & Code Structure](#architecture--code-structure)
* [System Flow](#system-flow)
* [Project Setup](#project-setup)
* [Running Tests](#running-tests)
* [Deployment](#deployment)
* [Resources](#resources)
* [License](#license)

---

## Features

### General

* **NestJS + TypeScript** backend with **RESTful API**.
* **JWT-based authentication** for all non-public endpoints; includes expiry and refresh token support.
* **Role-based access control (RBAC)**: patient, staff, admin.
* **Multi-tenancy**: each hospital is logically isolated; schema optimized for 1–2 million records.
* **Timezone handling**: all date/time operations respect the hospital’s timezone via `X-Timezone` header.
* **Hospital-specific SMTP** for outgoing emails.
* **Email notifications** for appointment events: booked, confirmed, modified, or cancelled.

### Admin Features

* Automatically generate **default admin account** when a hospital is created.
* Manage hospitals, staff accounts, and permissions.

### Staff Features

* Manage doctors: add/edit/remove profiles, set specialties, bio, and slot durations.
* Define **doctor working schedules** by day of the week.
* View doctor-wise appointment schedules.
* Book, confirm, modify, or cancel **appointments on behalf of patients**.
* Manage hospital details and staff permissions.

### Patient Features

* Register and manage account.
* Browse hospitals and doctors with availability.
* Book appointments if both doctor and slot are available.
* Receive **email notifications** for appointment events (booked, confirmed, modified, cancelled).
* View and cancel upcoming appointments.
* Appointment status flows: **Pending → Confirmed → Completed**, managed by staff.

### Scheduled Tasks (CRON)

***Email reminders** sent 1 day before appointments.

---

## Architecture & Code Structure

The backend is organized using **NestJS best practices** with modular architecture:

```
src/
├─ appointment/         # Handles appointment scheduling, status updates, notifications
├─ auth/                # JWT auth, login, logout, refresh, registration
├─ doctor/              # Doctor profiles, working hours, slot generation
├─ hospital/            # Hospital management and multi-tenancy
├─ patient/             # Patient registration and profile management
├─ staff/               # Staff management and permissions
├─ smtp/                # SMTP integration per hospital
├─ prisma/              # Prisma client, database models and relations
├─ middleware/          # Tenant middleware to scope requests per hospital
├─ utils/               # Helper functions like slot generation
├─ mail.module.ts       # Mail service module
├─ mail.service.ts      # Handles sending emails
├─ reminder.service.ts  # Scheduled email reminders
├─ main.ts              # Entry point
```

**Middleware**

* **Tenant Middleware (`tenant.middleware.ts`)**

  * Ensures multi-tenancy by **scoping requests to the correct hospital**.
  * Reads hospital identifier from request headers or JWT.
  * Sets the hospital context so all service calls (appointments, doctors, patients, staff) are correctly filtered for that hospital.

**Modules Overview**

* **Appointment Module**: creation, updating, cancellation, timezone-aware scheduling, and email notifications.
* **Doctor Module**: doctor profiles, specialties, working hours, and slot generation.
* **Hospital Module**: hospital registration, multi-tenancy enforcement, and admin account creation.
* **Patient Module**: registration, profile management, and appointment browsing/booking.
* **Staff Module**: staff management, permissions, appointment handling for patients.
* **Auth Module**: login, logout, JWT authentication, refresh tokens, RBAC.
* **SMTP Module**: hospital-specific SMTP integration for email notifications.
* **Prisma Module**: database ORM, relationships, indexing for performance.
* **Utils**: helper functions like slot generator and timezone handling.

---

## System Flow

1. **Hospital Creation**

   * Admin account automatically generated.
   * Hospital operates in its own timezone.
   * Tenant middleware ensures all requests are scoped to the correct hospital.

2. **Admin Operations**

   * Manage staff accounts, hospital details, and permissions.

3. **Staff Operations**

   * Manage doctors, working hours, and appointment slots.
   * Book, confirm, modify, or cancel appointments for patients.

4. **Patient Operations**

   * Register and browse hospitals/doctors.
   * Book appointments if doctor and slot available.
   * Receive **email notifications** for booked, confirmed, modified, or cancelled appointments.

5. **Appointment Status Flow**

   * **Pending → Confirmed → Completed**
   * Staff updates status; system triggers notifications automatically.

6. **Scheduled Tasks**

   * CRON jobs send **email reminders** 1 day before appointments.

---

## Project Setup

```bash
# Install dependencies
$ npm install

# Development mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

---

## Running Tests

```bash
# Unit tests
$ npm run test

# End-to-end tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

---

## Deployment

* Docker support with `docker-compose.yml` for local development.
* **Swagger API documentation** included for testing and review.

---

## Resources

* [NestJS Documentation](https://docs.nestjs.com)
* [NestJS Discord](https://discord.gg/G7Qnnhy)
* [NestJS Devtools](https://devtools.nestjs.com)

---

## License

MIT License
