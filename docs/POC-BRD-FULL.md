# POC Business Requirements Document (BRD)
## Multi-Channel Delivery Configuration (MDC) — Campaign Field Setup

| Item | Detail |
|------|--------|
| **Document Version** | 1.0 |
| **Date** | 2025-07-27 |
| **Status** | POC Draft |
| **Prepared For** | Business Stakeholders |
| **Document Type** | Proof of Concept — Business Requirements |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [POC Scope & Objectives](#2-poc-scope--objectives)
3. [Application Overview](#3-application-overview)
4. [Field Inventory by Module](#4-field-inventory-by-module)
   - 4.1 [Basic Info](#41-basic-info)
   - 4.2 [Extension Info](#42-extension-info)
   - 4.3 [Delivery Channel](#43-delivery-channel)
   - 4.4 [Opt-In Flag](#44-opt-in-flag)
   - 4.5 [Bounce Back](#45-bounce-back)
5. [Field Dependencies & Relationships](#5-field-dependencies--relationships)
   - 5.1 [Channel-Driven Field Visibility](#51-channel-driven-field-visibility)
   - 5.2 [Cross-Field Value Dependencies](#52-cross-field-value-dependencies)
   - 5.3 [Cross-Module Dependencies](#53-cross-module-dependencies)
6. [Data Architecture](#6-data-architecture)
7. [Validation Rules & Business Rules](#7-validation-rules--business-rules)
8. [Field Metadata](#8-field-metadata)
9. [POC Limitations & Future Considerations](#9-poc-limitations--future-considerations)

---

## 1. Executive Summary

This **Proof of Concept (POC)** document defines the business requirements for configuring multi-channel delivery campaigns within the MDC (Multi-Channel Delivery Configuration) system. It focuses on the **data model** — the fields required to define a campaign, their relationships, dependencies, validation rules, and how they map to underlying data structures.

The POC supports four delivery channels: **SMS**, **EMAIL**, **PUSH**, and **LETTER**. A campaign configuration consists of 48 fields organized across 5 modules. Many fields are conditionally visible or required based on the selected delivery channels and the values of other fields.

> **POC Purpose**: This document serves as a business alignment artifact to validate the field structure, relationships, and business rules before proceeding to full system development.

---

## 2. POC Scope & Objectives

### POC Objectives

| Objective | Description |
|-----------|-------------|
| **Validate Data Model** | Confirm the 48-field structure accurately represents business requirements |
| **Validate Field Dependencies** | Verify channel-driven and value-based field visibility logic |
| **Validate Business Rules** | Confirm validation rules and business constraints are correct |
| **AI Assistant Feasibility** | Demonstrate AI-assisted field configuration with minimal conversation rounds |

### In Scope (POC)

- Field definitions, dependencies, and validation rules for all 5 modules
- AI-assisted configuration for module-by-module field completion
- Reference use case matching for field pre-population
- Channel-driven field visibility logic
- POC level UI/UX for demonstrating the campaign configuration workflow

### Out of Scope (POC)

- Full production UI/UX implementation
- Integration with production MDC backend systems
- User authentication and role-based access control
- Audit logging and compliance reporting
- Multi-language support

---

## 3. Application Overview

### Business Purpose

The MDC Campaign Configuration application enables business teams to define and register notification campaigns that deliver messages to customers across multiple channels. Each campaign configuration captures:

- **Who** owns and manages the campaign (people and departments)
- **What** type of message is being sent (classification, risk level)
- **Where** it applies (entity, market, line of business)
- **How** messages are delivered (channels, routing, sender identity)
- **What happens when delivery fails** (bounce back, fallback channels)

### AI-Assisted Configuration (POC Capability)

The POC includes an intelligent assistant that guides users through the field configuration process. The assistant operates with the following business requirements:

- **Module-by-module guidance**: The assistant walks users through each module in sequence (Basic Info → Extension Info → Delivery Channel → Opt-In Flag → Bounce Back), ensuring all required fields are completed before advancing.
- **Minimal conversation rounds**: The assistant is designed to collect the maximum amount of information per interaction, reducing the number of back-and-forth exchanges needed to complete a full campaign configuration.
- **Contextual field prompting**: The assistant understands field dependencies and only prompts for fields that are relevant given the current configuration (e.g., it will not ask for PUSH-specific fields if no PUSH channel is selected).
- **Reference use cases**: The assistant can reference historical campaign configurations to pre-fill fields where patterns match, accelerating the setup process.

> **POC Note**: The AI assistant demonstrates the feasibility of intelligent field guidance. Production implementation may include enhanced natural language understanding, integration with enterprise knowledge bases, and advanced pattern recognition.

---

## 4. Field Inventory by Module

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Required — must be filled to proceed |
| 🔶 | Required by UI — shown in the form, should be filled |
| ⚡ | Conditional — required only when a dependency is met |
| ⬜ | Optional — not required, user may fill if applicable |
| 📌 | Has dependencies on other fields or channels |

---

### 4.1 Basic Info

**Module Purpose**: Captures the fundamental identity of the campaign — who it belongs to, what market it serves, and which system triggers it.

| # | Field Name | Display Name | Business Description | Required | Options / Enum | Provided By | Dependencies |
|---|-----------|--------------|---------------------|----------|----------------|-------------|--------------|
| 1 | `group_member` | Entity | Entity / group member | ✅ Required | `HASE`, `HSBC` | Business | — |
| 2 | `country_code` | Market | Business area the use case covers | ✅ Required | `INHK` (HK/MO), `HASE` (HK only) | Business | — |
| 3 | `line_of_business` | Line Of Business | Line of business | ✅ Required | `WPB`, `RB`, `CMB` | Business | 📌 Editable in create mode only |
| 4 | `use_case_name` | Use Case Name | Business scenario for message triggering; used for MDC MI report lookup | ✅ Required | Free text | Business | — |
| 5 | `project_name` | Project Name | Project name | ✅ Required | Free text | Business / IT PM | — |
| 6 | `source_system` | Source System | Source system that passes notification request to MDC | ✅ Required | Free text | Business / IT PM / Source System IT | — |
| 7 | `downstream_name` | Downstream Name | Downstream system that MDC passes notification request to | ⬜ Optional | Free text | Business / IT PM / Downstream System IT | — |
| 8 | `service_line` | Service Line | Message servicing nature | ✅ Required | `Servicing`, `Marketing` | Business | — |

**Total fields**: 8 (7 Required, 1 Optional)

---

### 4.2 Extension Info

**Module Purpose**: Captures ownership hierarchy, message classification (risk, schedule, dual-channel), and business context (journeys, trigger conditions, regulatory requirements).

| # | Field Name | Display Name | Business Description | Required | Options / Enum | Provided By | Dependencies |
|---|-----------|--------------|---------------------|----------|----------------|-------------|--------------|
| 9 | `depart_head` | Depart. Head | Department head, MD or GCB 2 | 🔶 Required by UI | Free text | Business | — |
| 10 | `team_head` | Team Head | Team head, GCB 3 | 🔶 Required by UI | Free text | Business | — |
| 11 | `message_owner` | Message Owner | Message owner, GCB 5 or above | ✅ Required | Free text | Business | — |
| 12 | `business_line_1st_level` | Business Line 1st Level | Department of the department head | 🔶 Required by UI | Free text | Business | — |
| 13 | `business_line_2nd_level` | Business Line 2nd Level | Department of the team head | 🔶 Required by UI | Free text | Business | — |
| 14 | `delivery_schedule` | Is 7×24 | Whether delivery schedule supports 7×24 | ✅ Required | `Yes` (7×24), `No` | Business | — |
| 15 | `delivery_schedule_other` | Other Schedule | Expected delivery frequency if not 7×24 | ✅ Required | Free text | Business | 📌 Depends on `delivery_schedule` = `No` |
| 16 | `high_risk_flag` | Is High Risk | High risk critical message flag (regulatory, time-sensitive, high-risk transaction) | ✅ Required | `Yes`, `No` | Business | — |
| 17 | `is_dual_channel` | Is Dual Channel | Whether the message requires dual channel delivery | ⬜ Optional | `Yes`, `No` | Business | — |
| 18 | `support_dual_vendor` | Support Dual Vendor | Whether SMS requires dual vendor routing; **mandatory for high-risk messages** | ⬜ Optional | `Yes`, `No` | Business | 📌 Business rule: if `high_risk_flag` = `Yes`, then must be `Yes` |
| 19 | `business_team` | Business Team | Business team | ⬜ Optional | Free text | Business | — |
| 20 | `business_contact` | Business Contact | Business contact | ⬜ Optional | Free text | Business | — |
| 21 | `message_trigger_conditions` | Message Trigger Conditions | Message trigger conditions | ⬜ Optional | Free text (long) | Business | — |
| 22 | `message_journey` | Message Journey | Message journey | ⬜ Optional | Free text | Business | — |
| 23 | `customer_journey` | Customer Journey | Customer journey | ⬜ Optional | Free text | Business | — |
| 24 | `business_journey` | Business Journey | Business journey | ⬜ Optional | Free text | Business | — |
| 25 | `remarks` | Remarks | Key information | ⬜ Optional | Free text (long) | Business / IT (if any) | — |
| 26 | `regulatory_requirement` | Regulatory Requirement | Regulatory requirement details (e.g., MECP B9 + B11, TM-E-1 FAQ 4.1 Q11) | ⬜ Optional | Free text | Business | — |
| 27 | `cost_owner` | Cost Owner | Cost owner | 🔶 Required by UI | Free text | Business | — |

**Total fields**: 19 (4 Required, 5 Required by UI, 10 Optional)

---

### 4.3 Delivery Channel

**Module Purpose**: Defines which channels are used for message delivery and configures channel-specific settings (sender identity, routing, encryption, traffic distribution).

| # | Field Name | Display Name | Business Description | Required | Options / Enum | Provided By | Dependencies |
|---|-----------|--------------|---------------------|----------|----------------|-------------|--------------|
| 28 | `channel` | Delivery Channel | Selected delivery channel(s) | ✅ Required | `SMS`, `EMAIL`, `PUSH`, `LETTER` | Business | — |
| 29 | `priority` | Priority | Channel priority / mandatory routing | ⚡ Conditional | `High`, `Medium`, `Low` | Business | 📌 Required when any channel is selected |
| 30 | `app_name` | App Name | App name for Push Notification | ⚡ Conditional | Free text | Business | 📌 Depends on `PUSH` channel |
| 31 | `send_to_china_flag` | Send to China | Whether to send to China mobile number | ⚡ Conditional | `Yes`, `No` | Business | 📌 Depends on `SMS` channel |
| 32 | `traffic_percentage` | Traffic Percentage | Traffic split percentage across vendor paths | ⚡ Conditional | Numeric (0–100) | Business / MDC IT | 📌 Depends on `SMS`, `EMAIL`, `PUSH` |
| 33 | `sender` | Sender | Sender ID/address/name depending on channel | ⚡ Conditional | Free text | Business | 📌 Depends on `SMS`, `EMAIL` |
| 34 | `sender_name` | Sender Name | Email sender name | ⚡ Conditional | Free text | Business | 📌 Depends on `EMAIL` |
| 35 | `cost_center_id` | Cost Center Id | SMS cost center ID | ⚡ Conditional | Free text (numeric) | Business | 📌 Depends on `SMS` |
| 36 | `encrypt_type` | Encrypt Type | Email encryption type | ⚡ Conditional | `TLS` (public/internal), `Encrypt` (restricted/highly restricted) | Business | 📌 Depends on `EMAIL` PFP path |

**Total fields**: 9 (1 Required, 8 Conditional)

**Typical Traffic Percentage Patterns:**
| Scenario | HTCL | CSL | Purpose |
|----------|------|-----|---------|
| High-risk real-time message | 100% | 0% | Resilience |
| One-time-password (TC) | 70% | 30% | Resilience |
| Real-time / batch message | 100% | — | Standard |

**Sender ID Examples by Channel:**
| Channel | Sender Format | Example |
|---------|--------------|---------|
| SMS | Sender ID number | e.g., `HASE` |
| EMAIL | Sender domain (bold part self-identifiable) | hangseng@mail.test.**hangseng**.com |

---

### 4.4 Opt-In Flag

**Module Purpose**: Manages customer opt-in preferences for push notification channels. These flags determine whether a customer has consented to receive specific types of push notifications.

| # | Field Name | Display Name | Business Description | Required | Options / Enum | Provided By | Dependencies |
|---|-----------|--------------|---------------------|----------|----------------|-------------|--------------|
| 37 | `push_optin_flag` | Master | Opt-in master flag | ⬜ Optional / Generated | Boolean | Business | 📌 Depends on `PUSH` channel |
| 38 | `marketing_optin_flag` | Marketing | Push marketing opt-in flag | ⬜ Optional / Generated | Boolean | Business | 📌 Depends on `PUSH` + `app_name` |
| 39 | `high_risk_push_optin_flag` | High Risk | Push high risk opt-in flag | ⬜ Optional / Generated | Boolean | Business | 📌 Depends on `PUSH` DAASC |

**Total fields**: 3 (all Optional / Generated)

**Opt-In Flag Hierarchy:**
```
Master Opt-in (push_optin_flag)
├── Marketing Opt-in (marketing_optin_flag)
└── High Risk Opt-in (high_risk_push_optin_flag)
```

> **Note**: Opt-In Flag fields are only relevant when the **PUSH** channel is selected. They are auto-generated based on channel and sub-path selections.

---

### 4.5 Bounce Back

**Module Purpose**: Configures fallback behavior when message delivery fails or does not receive confirmation within a specified period. Bounce back enables automatic routing to alternative channels.

| # | Field Name | Display Name | Business Description | Required | Options / Enum | Provided By | Dependencies |
|---|-----------|--------------|---------------------|----------|----------------|-------------|--------------|
| 40 | `bounce_back` | Callback | Bounce back callback flag; mobile calls MDC API on PN receipt; triggers next channel if no callback within pre-set period | 🔶 Required by section | `Yes`, `No` | Business | 📌 Depends on `PUSH` channel |
| 41 | `letter_bounce_back_success_flag` | Letter Bounce Back | For INHK eStatement/eAdvice: triggers e-Notification when eStatement/eAdvice is ready on website | ⬜ Optional | `Yes`, `No` | Business | 📌 Depends on `LETTER` channel |
| 42 | `push_bounce_back_period` | Push Bounce Back Period | Minutes to wait for PUSH callback before triggering next channel | ⬜ Optional | Numeric (minutes) | Business | 📌 Depends on `bounce_back` = `Yes` |
| 43 | `sms_bounce_back_period` | SMS Bounce Back Period | Minutes to wait for SMS SENT status before triggering next channel | ⬜ Optional | Numeric (minutes) | Business | 📌 Depends on `unknown_bounce_back_status` |
| 44 | `email_bounce_back_period` | Email Bounce Back Period | Minutes to wait for EMAIL SENT status before triggering next channel | ⬜ Optional | Numeric (minutes) | Business | 📌 Depends on `unknown_bounce_back_status` |
| 45 | `letter_bounce_back_period` | Letter Bounce Back Period | Minutes to wait for LETTER FAILED status before triggering next channel | ⬜ Optional | Numeric (minutes) | Business | 📌 Depends on `unknown_bounce_back_status` |
| 46 | `bounce_back_next_channel` | Bounce Back Next Channel | Whether to route to next channel after bounce back failure | ⬜ Optional | `Yes`, `No` | Business | — |
| 47 | `unknown_bounce_back_status` | Unknown Bounce Back Status | When enabled, MDC checks bounce back periods and triggers next channel if no successful SENT status received | ⬜ Optional | `Yes`, `No` | Business | — |
| 48 | `auto_bounce_back_flag` | Auto Update Invalid Flag | Auto-update mobile/email invalid flag to CUS when SMS/Email delivery fails with specific failure reasons | ⬜ Optional | `Yes`, `No` | Business | — |

**Total fields**: 9 (1 Required by section, 8 Optional)

---

## 5. Field Dependencies & Relationships

This section documents all dependency relationships between fields, channels, and modules.

### 5.1 Channel-Driven Field Visibility

When a user selects one or more delivery channels, specific fields become visible or required across multiple modules.

#### Channel → Activated Fields Matrix

| Field | SMS | EMAIL | PUSH | LETTER |
|-------|:---:|:-----:|:----:|:------:|
| **Delivery Channel** | | | | |
| `priority` | ✅ | ✅ | ✅ | ✅ |
| `send_to_china_flag` | ✅ | | | |
| `traffic_percentage` | ✅ | ✅ | ✅ | |
| `sender` | ✅ | ✅ | | |
| `sender_name` | | ✅ | | |
| `cost_center_id` | ✅ | | | |
| `encrypt_type` | | ✅ | | |
| `app_name` | | | ✅ | |
| **Opt-In Flag** | | | | |
| `push_optin_flag` | | | ✅ | |
| `marketing_optin_flag` | | | ✅ | |
| `high_risk_push_optin_flag` | | | ✅ | |
| **Bounce Back** | | | | |
| `bounce_back` | | | ✅ | |
| `sms_bounce_back_period` | ✅ | | | |
| `email_bounce_back_period` | | ✅ | | |
| `push_bounce_back_period` | | | ✅ | |
| `letter_bounce_back_success_flag` | | | | ✅ |
| `letter_bounce_back_period` | | | | ✅ |

#### Channel Dependency Flowchart

```
                        ┌─────────────────────┐
                        │  Channel Selected?   │
                        └──────────┬──────────┘
                                   │
          ┌────────────┬───────────┼───────────┬────────────┐
          ▼            ▼           ▼           ▼            │
      ┌───────┐   ┌────────┐  ┌────────┐  ┌─────────┐     │
      │  SMS  │   │ EMAIL  │  │  PUSH  │  │ LETTER  │     │
      └───┬───┘   └───┬────┘  └───┬────┘  └────┬────┘     │
          │           │           │             │          │
          ▼           ▼           ▼             ▼          │
    ┌───────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐│
    │ sender    │ │ sender   │ │ app_name   │ │ letter_  ││
    │ send_to_  │ │ sender_  │ │            │ │ bounce_  ││
    │  china    │ │ name     │ │ Opt-In:    │ │ back_    ││
    │ cost_     │ │ encrypt_ │ │  push_     │ │ success  ││
    │  center   │ │  type    │ │  optin     │ │ _flag    ││
    │ traffic_  │ │ traffic_ │ │  marketing │ │ letter_  ││
    │  %        │ │  %       │ │  _optin    │ │ bounce_  ││
    │           │ │          │ │  high_risk │ │  _period ││
    │ sms_      │ │ email_   │ │  _optin    │ └──────────┘│
    │ bounce_   │ │ bounce_  │ │            │             │
    │  period   │ │  period  │ │ Bounce:    │             │
    └───────────┘ └──────────┘ │  bounce_   │             │
                               │  _back     │             │
                               │  push_     │             │
                               │  bounce_   │             │
                               │  _period   │             │
                               └────────────┘             │
                                                          │
    ┌─────────────────────────────────────────────────────┘
    │  Applies to ALL channels:
    │  • priority
    │  • traffic_percentage (SMS/EMAIL/PUSH only)
    ▼
```

---

### 5.2 Cross-Field Value Dependencies

Some fields become visible, required, or change behavior based on the **value** of another field.

#### Value Dependency Matrix

| Target Field | Depends On | Condition | Effect |
|-------------|-----------|-----------|--------|
| `delivery_schedule_other` | `delivery_schedule` | = `No` | Field becomes visible/required |
| `support_dual_vendor` | `high_risk_flag` | = `Yes` | **Must** be `Yes` (business rule) |
| `push_bounce_back_period` | `bounce_back` | = `Yes` | Field becomes visible |
| `sms_bounce_back_period` | `unknown_bounce_back_status` | = `Yes` | Field becomes visible |
| `email_bounce_back_period` | `unknown_bounce_back_status` | = `Yes` | Field becomes visible |
| `letter_bounce_back_period` | `unknown_bounce_back_status` | = `Yes` | Field becomes visible |
| `marketing_optin_flag` | `app_name` | Has value | Field becomes visible |
| `line_of_business` | (create mode) | Always | Editable only in create mode |

#### Value Dependency Flowcharts

**1. Delivery Schedule Flow:**

```
                 ┌─────────────────────┐
                 │ delivery_schedule ?  │
                 └──────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
        ┌──────────┐                ┌──────────┐
        │   Yes    │                │    No    │
        │  (7×24)  │                │          │
        └──────────┘                └────┬─────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ delivery_schedule_    │
                              │ other                 │
                              │ (REQUIRED - specify   │
                              │  delivery frequency)  │
                              └──────────────────────┘
```

**2. High Risk → Dual Vendor Flow:**

```
                 ┌─────────────────────┐
                 │  high_risk_flag ?    │
                 └──────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
        ┌──────────┐                ┌──────────┐
        │   Yes    │                │    No    │
        └────┬─────┘                └──────────┘
             │
             ▼
   ┌────────────────────────┐
   │ support_dual_vendor    │
   │ MUST be = Yes          │
   │ (Business Rule:        │
   │  high-risk messages    │
   │  require dual vendor)  │
   └────────────────────────┘
```

**3. Bounce Back Period Flows:**

```
  PUSH Channel:                      SMS / EMAIL / LETTER Channels:

  ┌──────────────┐                   ┌───────────────────────────┐
  │ bounce_back? │                   │ unknown_bounce_back_      │
  └──────┬───────┘                   │ status?                   │
         │                           └─────────────┬─────────────┘
    ┌────┴────┐                                    │
    ▼         ▼                              ┌─────┴─────┐
  Yes        No                              ▼           ▼
    │                                       Yes         No
    ▼                                         │
  ┌──────────────────────┐                    ▼
  │ push_bounce_back_    │         ┌─────────────────────────┐
  │ period               │         │ sms_bounce_back_period  │
  │ (visible)            │         │ email_bounce_back_period│
  └──────────────────────┘         │ letter_bounce_back_     │
                                   │   period                │
                                   │ (visible based on       │
                                   │  selected channel)      │
                                   └─────────────────────────┘
```

**4. Opt-In Flag Hierarchy:**

```
                    ┌─────────────────────┐
                    │  PUSH Channel?      │
                    └──────────┬──────────┘
                               │
                               ▼ (if PUSH selected)
                    ┌─────────────────────┐
                    │ push_optin_flag     │
                    │ (Master Opt-in)     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
   ┌─────────────────────┐          ┌──────────────────────┐
   │ marketing_optin_    │          │ high_risk_push_      │
   │ flag                │          │ optin_flag           │
   │ (depends on PUSH +  │          │ (depends on PUSH     │
   │  app_name value)    │          │  DAASC path)         │
   └─────────────────────┘          └──────────────────────┘
```

---

### 5.3 Cross-Module Dependencies

Fields in one module can affect fields in another module.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CROSS-MODULE DEPENDENCY MAP                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐         ┌──────────────────┐        ┌─────────────┐  │
│  │  Basic Info   │         │  Extension Info   │        │   Delivery  │  │
│  │              │         │                  │        │   Channel   │  │
│  │ service_line │────────▶│ regulatory_      │        │             │  │
│  │ (Servicing/  │         │  requirement     │        │  channel ───┼──┼──┐
│  │  Marketing)  │         │ (recommended if  │        │  (SMS/EMAIL/│  │  │
│  │              │         │  Servicing)      │        │  PUSH/      │  │  │
│  └──────────────┘         │                  │        │  LETTER)    │  │  │
│                           │ high_risk_flag ──┼────────┼─────────────┼──┼──┤
│                           │                  │        │             │  │  │
│                           │ delivery_schedule│        └─────────────┘  │  │
│                           │  └▶ other sched  │                         │  │
│                           │                  │                         │  │
│                           │ support_dual_    │                         │  │
│                           │  vendor          │                         │  │
│                           │  (must=Yes if    │                         │  │
│                           │   high_risk)     │                         │  │
│                           └──────────────────┘                         │  │
│                                                                        │  │
│  ┌──────────────────────┐     ┌──────────────────────────────────────┐ │  │
│  │    Opt-In Flag        │     │          Bounce Back                 │ │  │
│  │                      │     │                                      │ │  │
│  │ push_optin_flag ◀────┼─────┤ bounce_back (PUSH only)              │ │  │
│  │ marketing_optin ◀────┼─────┤ push_bounce_back_period ◀── bounce   │ │  │
│  │ high_risk_optin ◀────┼─────┤ sms_bounce_back_period ◀── unknown   │ │  │
│  │                      │     │ email_bounce_back_period ◀── unknown  │ │  │
│  └──────────────────────┘     │ letter_bounce_back_period ◀── unknown │ │  │
│                               │ bounce_back_next_channel              │ │  │
│                               │ auto_bounce_back_flag                 │ │  │
│                               └──────────────────────────────────────┘ │  │
│                                                                        │  │
│  Legend: ───▶ activates/enables    ◀──── depends on                    │  │
│                                                                        │  │
└────────────────────────────────────────────────────────────────────────┘  │
                                                                            │
        ┌───────────────────────────────────────────────────────────────────┘
        │
        │  Channel selection drives visibility across ALL modules:
        │
        │  SMS ──────▶ Delivery Channel: sender, send_to_china, cost_center_id, traffic_%
        │           ──▶ Bounce Back: sms_bounce_back_period
        │
        │  EMAIL ───▶ Delivery Channel: sender, sender_name, encrypt_type, traffic_%
        │           ──▶ Bounce Back: email_bounce_back_period
        │
        │  PUSH ────▶ Delivery Channel: app_name, traffic_%
        │           ──▶ Opt-In Flag: push_optin_flag, marketing_optin, high_risk_optin
        │           ──▶ Bounce Back: bounce_back, push_bounce_back_period
        │
        │  LETTER ──▶ Bounce Back: letter_bounce_back_success_flag, letter_bounce_back_period
        └───────────────────────────────────────────────────────────────────
```

---

## 6. Data Architecture

### Simplified ERD (Business Field Names)

The 48 fields are stored across **3 database tables**. The following ERD shows the logical grouping of fields by table, using business field names.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   tbl_use_case (Core Campaign Identity)                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ group_member     │  │ country_code     │  │ line_of_business │      │   │
│   │  │ (Entity)         │  │ (Market)         │  │ (LOB)            │      │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ use_case_name    │  │ project_name     │  │ source_system    │      │   │
│   │  │ (Use Case Name)  │  │ (Project Name)   │  │ (Source System)  │      │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ service_line     │  │ high_risk_flag   │  │ delivery_schedule│      │   │
│   │  │ (Service Line)   │  │ (Is High Risk)   │  │ (Is 7×24)        │      │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ is_dual_channel  │  │ bounce_back      │  │ letter_bounce_   │      │   │
│   │  │ (Is Dual Channel)│  │ (Callback)       │  │  back_success    │      │   │
│   │  └──────────────────┘  └──────────────────┘  │  (Letter BB)     │      │   │
│   │                                               └──────────────────┘      │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ push_optin_flag  │  │ marketing_optin  │  │ high_risk_push_  │      │   │
│   │  │ (Master Opt-in)  │  │  _flag           │  │  optin_flag      │      │   │
│   │  │                  │  │ (Marketing)      │  │ (High Risk)      │      │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│                          │                                                      │
│                          │ 1                                                    │
│                          │                                                      │
│                          ▼ N                                                    │
│   tbl_use_case_ext (Extended Campaign Details)                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ downstream_name  │  │ depart_head      │  │ team_head        │      │   │
│   │  │ (Downstream)     │  │ (Depart. Head)   │  │ (Team Head)      │      │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ message_owner    │  │ business_line_   │  │ business_line_   │      │   │
│   │  │ (Message Owner)  │  │  1st_level       │  │  2nd_level       │      │   │
│   │  └──────────────────┘  │ (BL 1st Level)   │  │ (BL 2nd Level)   │      │   │
│   │                         └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ business_team    │  │ business_contact │  │ message_trigger_ │      │   │
│   │  │ (Business Team)  │  │ (Business Contact│  │  conditions      │      │   │
│   │  └──────────────────┘  └──────────────────┘  │ (Trigger Conds)  │      │   │
│   │                                               └──────────────────┘      │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ message_journey  │  │ customer_journey │  │ business_journey │      │   │
│   │  │ (Message Journey)│  │ (Cust. Journey)  │  │ (Bus. Journey)   │      │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ remarks          │  │ regulatory_      │  │ cost_owner       │      │   │
│   │  │ (Remarks)        │  │  requirement     │  │ (Cost Owner)     │      │   │
│   │  └──────────────────┘  │ (Reg. Requirement│  └──────────────────┘      │   │
│   │                         └──────────────────┘                            │   │
│   │  ┌──────────────────┐                                                   │   │
│   │  │ support_dual_    │                                                   │   │
│   │  │ vendor           │                                                   │   │
│   │  │ (Dual Vendor)    │                                                   │   │
│   │  └──────────────────┘                                                   │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│                          │                                                      │
│                          │ 1                                                    │
│                          │                                                      │
│                          ▼ N                                                    │
│   tbl_use_case_channel_rule (Channel-Specific Configuration)                    │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ channel          │  │ priority         │  │ traffic_         │      │   │
│   │  │ (Delivery Channel│  │ (Priority)       │  │  percentage      │      │   │
│   │  │  SMS/EMAIL/      │  │                  │  │ (Traffic %)      │      │   │
│   │  │  PUSH/LETTER)    │  │                  │  │                  │      │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │   │
│   │  │ sender           │  │ sender_name      │  │ cost_center_id   │      │   │
│   │  │ (Sender ID/Addr) │  │ (Sender Name)    │  │ (Cost Center)    │      │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐                                                   │   │
│   │  │ encrypt_type     │                                                   │   │
│   │  │ (Encrypt Type)   │                                                   │   │
│   │  └──────────────────┘                                                   │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Table Relationships Summary

| Table | Purpose | Field Count | Key Relationship |
|-------|---------|-------------|-----------------|
| `tbl_use_case` | Core campaign identity, classification, and opt-in flags | 16 | Primary record; one record per campaign |
| `tbl_use_case_ext` | Extended details: ownership, journeys, business context | 19 | 1:N with `tbl_use_case`; one extension per campaign |
| `tbl_use_case_channel_rule` | Channel-specific delivery configuration | 9 | 1:N with `tbl_use_case`; one rule per channel per campaign |

---

## 7. Validation Rules & Business Rules

### 7.1 Field Requirement Rules

| Rule ID | Field(s) | Rule Type | Rule Description |
|---------|----------|-----------|-----------------|
| VR-01 | `group_member`, `country_code`, `line_of_business`, `use_case_name`, `project_name`, `source_system`, `service_line` | Required | Must be filled before completing Basic Info module |
| VR-02 | `message_owner`, `delivery_schedule`, `high_risk_flag` | Required | Must be filled before completing Extension Info module |
| VR-03 | `channel` | Required | At least one delivery channel must be selected |
| VR-04 | `depart_head`, `team_head`, `business_line_1st_level`, `business_line_2nd_level`, `cost_owner` | Required by UI | Displayed in form; strongly recommended to fill |
| VR-05 | `priority` | Conditional | Required when any delivery channel is selected |

### 7.2 Conditional Visibility Rules

| Rule ID | Target Field | Condition | Behavior |
|---------|-------------|-----------|----------|
| CV-01 | `delivery_schedule_other` | `delivery_schedule` = `No` | Field becomes visible and required |
| CV-02 | `app_name` | PUSH channel selected | Field becomes visible and required |
| CV-03 | `send_to_china_flag` | SMS channel selected | Field becomes visible |
| CV-04 | `sender` | SMS or EMAIL channel selected | Field becomes visible |
| CV-05 | `sender_name` | EMAIL channel selected | Field becomes visible |
| CV-06 | `cost_center_id` | SMS channel selected | Field becomes visible |
| CV-07 | `encrypt_type` | EMAIL channel selected (PFP path) | Field becomes visible |
| CV-08 | `traffic_percentage` | SMS, EMAIL, or PUSH channel selected | Field becomes visible |
| CV-09 | `push_optin_flag` | PUSH channel selected | Field becomes visible |
| CV-10 | `marketing_optin_flag` | PUSH channel selected AND `app_name` has value | Field becomes visible |
| CV-11 | `high_risk_push_optin_flag` | PUSH channel selected (DAASC path) | Field becomes visible |
| CV-12 | `bounce_back` | PUSH channel selected | Field becomes visible |
| CV-13 | `push_bounce_back_period` | `bounce_back` = `Yes` | Field becomes visible |
| CV-14 | `sms_bounce_back_period` | SMS channel selected AND `unknown_bounce_back_status` = `Yes` | Field becomes visible |
| CV-15 | `email_bounce_back_period` | EMAIL channel selected AND `unknown_bounce_back_status` = `Yes` | Field becomes visible |
| CV-16 | `letter_bounce_back_period` | LETTER channel selected AND `unknown_bounce_back_status` = `Yes` | Field becomes visible |
| CV-17 | `letter_bounce_back_success_flag` | LETTER channel selected | Field becomes visible |

### 7.3 Business Logic Rules

| Rule ID | Rule Name | Description | Affected Fields |
|---------|-----------|-------------|-----------------|
| BR-01 | High-Risk Dual Vendor | If `high_risk_flag` = `Yes`, then `support_dual_vendor` **must** be `Yes` | `high_risk_flag`, `support_dual_vendor` |
| BR-02 | High-Risk Traffic Split | High-risk real-time messages should use HTCL-100%, CSL-0% for resilience | `traffic_percentage` |
| BR-03 | OTP Traffic Split | One-time-password messages should use HTCL-70%, CSL-30% for resilience | `traffic_percentage` |
| BR-04 | Real-time/Batch Traffic | Standard real-time or batch messages should use HTCL-100% | `traffic_percentage` |
| BR-05 | Bounce Back → Next Channel | If `bounce_back` or `unknown_bounce_back_status` is enabled, `bounce_back_next_channel` should be configured | `bounce_back_next_channel` |
| BR-06 | Auto Invalid Flag | `auto_bounce_back_flag` controls whether failed delivery automatically marks customer contact as invalid in CUS | `auto_bounce_back_flag` |
| BR-07 | Regulatory + Service Line | If `service_line` = `Servicing`, `regulatory_requirement` is recommended to be filled | `regulatory_requirement` |
| BR-08 | PUSH Opt-in Master | If PUSH channel is selected, `push_optin_flag` (master) must be addressed | `push_optin_flag` |
| BR-09 | Line of Business Edit Lock | `line_of_business` is only editable during campaign creation, not in edit mode | `line_of_business` |

### 7.4 Value Constraint Rules

| Rule ID | Field | Constraint | Description |
|---------|-------|-----------|-------------|
| VC-01 | `traffic_percentage` | 0–100 | Must be a valid percentage |
| VC-02 | `push_bounce_back_period` | Positive integer | Minutes; must be > 0 |
| VC-03 | `sms_bounce_back_period` | Positive integer | Minutes; must be > 0 |
| VC-04 | `email_bounce_back_period` | Positive integer | Minutes; must be > 0 |
| VC-05 | `letter_bounce_back_period` | Positive integer | Minutes; must be > 0 |
| VC-06 | `cost_center_id` | Numeric string | e.g., `25267613` |

---

## 8. Field Metadata

### 8.1 Provided By Summary

| Provider Role | Fields Count | Typical Fields |
|--------------|-------------|----------------|
| Business | 40 | Most fields; primary owner of campaign configuration |
| Business / IT PM | 2 | `project_name`, `downstream_name` |
| Business / IT PM / Source System IT | 1 | `source_system` |
| Business / IT PM / Downstream System IT | 1 | `downstream_name` |
| Business / MDC IT | 1 | `traffic_percentage` |
| Business / IT (if any) | 1 | `remarks` |

### 8.2 DB Table Mapping Summary

| Table | Module(s) | Field Count |
|-------|----------|-------------|
| `tbl_use_case` | Basic Info (partial), Extension Info (partial), Opt-In Flag, Bounce Back | 16 |
| `tbl_use_case_ext` | Basic Info (partial), Extension Info (partial) | 19 |
| `tbl_use_case_channel_rule` | Delivery Channel | 9 |
| *(no table)* | Extension Info (`delivery_schedule_other`) | 1 |

### 8.3 Complete Field Count by Module

| Module | Required | Required by UI | Conditional | Optional | Total |
|--------|----------|---------------|-------------|----------|-------|
| Basic Info | 7 | 0 | 0 | 1 | 8 |
| Extension Info | 4 | 5 | 0 | 10 | 19 |
| Delivery Channel | 1 | 0 | 8 | 0 | 9 |
| Opt-In Flag | 0 | 0 | 0 | 3 | 3 |
| Bounce Back | 0 | 1 | 0 | 8 | 9 |
| **Total** | **12** | **6** | **8** | **22** | **48** |

---

## 9. POC Limitations & Future Considerations

### POC Limitations

| Area | Limitation | Impact |
|------|-----------|--------|
| **Data Persistence** | POC uses mock data; no real database integration | Field values are not persisted between sessions |
| **AI Assistant** | Demonstrates feasibility only; limited training data | May not handle all edge cases or complex queries |
| **Validation** | Basic client-side validation; no server-side enforcement | Business rules are for demonstration purposes |
| **Integration** | No integration with production MDC, CUS, or other systems | Field values are illustrative only |
| **User Management** | No authentication or role-based access | All users have full access in POC |

### Future Considerations

| Area | Recommendation |
|------|---------------|
| **Production Data Model** | Validate ERD with database team; consider indexing strategy |
| **AI Training** | Expand training data with real historical campaigns |
| **Validation Engine** | Implement server-side validation for all business rules |
| **Integration** | Design APIs for MDC, CUS, and downstream system integration |
| **Audit Trail** | Add change tracking for compliance requirements |
| **Multi-language** | Support Traditional Chinese, Simplified Chinese, English |

---

*End of POC BRD — Full Version*
