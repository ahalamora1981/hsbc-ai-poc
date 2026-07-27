# POC Business Requirements Document (BRD)
## Multi-Channel Delivery Configuration — Basic Info, Extension Info, Channel Selection & Opt-In Flag

| Item | Detail |
|------|--------|
| **Document Version** | 1.0 |
| **Date** | 2025-07-27 |
| **Status** | POC Draft |
| **Scope** | Basic Info, Extension Info, Channel Selection (single field), Opt-In Flag |
| **Prepared For** | Business Stakeholders |
| **Document Type** | Proof of Concept — Business Requirements (Partial Scope) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [POC Scope & Objectives](#2-poc-scope--objectives)
3. [Application Overview](#3-application-overview)
4. [Field Inventory by Module](#4-field-inventory-by-module)
   - 4.1 [Basic Info](#41-basic-info)
   - 4.2 [Extension Info](#42-extension-info)
   - 4.3 [Channel Selection](#43-channel-selection)
   - 4.4 [Opt-In Flag](#44-opt-in-flag)
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

This **Proof of Concept (POC)** document defines the business requirements for the **Basic Info**, **Extension Info**, **Channel Selection**, and **Opt-In Flag** modules of the MDC (Multi-Channel Delivery Configuration) system. It focuses on the data model — the fields required, their relationships, dependencies, and validation rules.

This partial BRD covers **31 fields** out of the full 48-field campaign configuration:
- **Basic Info** (8 fields): Core campaign identity
- **Extension Info** (19 fields): Ownership, classification, and business context
- **Channel Selection** (1 field): The `channel` field that drives downstream dependencies
- **Opt-In Flag** (3 fields): Customer consent for push notifications

The remaining modules (Delivery Channel configuration, Bounce Back) are covered in the full POC BRD (`POC-BRD-FULL.md`).

> **POC Purpose**: This document serves as a business alignment artifact to validate the field structure, relationships, and business rules for the core campaign modules before proceeding to full system development.

---

## 2. POC Scope & Objectives

### POC Objectives

| Objective | Description |
|-----------|-------------|
| **Validate Core Data Model** | Confirm the Basic Info and Extension Info field structures accurately represent business requirements |
| **Validate Channel Dependencies** | Verify channel-driven field visibility logic for Opt-In Flag module |
| **Validate Business Rules** | Confirm validation rules and business constraints for core modules |
| **AI Assistant Feasibility** | Demonstrate AI-assisted field configuration with minimal conversation rounds |

### In Scope (This POC Document)

- Basic Info module (8 fields)
- Extension Info module (19 fields)
- Channel Selection field (`channel` only)
- Opt-In Flag module (3 fields)
- Channel dependency logic showing what each channel activates in **all modules** (including those covered in full BRD)
- Cross-field and cross-module dependencies for covered fields
- POC level UI/UX for demonstrating the covered modules workflow

### Out of Scope (This POC Document)

- Full Delivery Channel module configuration (sender, priority, traffic split, etc.)
- Full Bounce Back module configuration
- Full production UI/UX implementation
- Integration with production MDC backend systems

---

## 3. Application Overview

### Business Purpose

The MDC Campaign Configuration application enables business teams to define and register notification campaigns that deliver messages to customers across multiple channels. Each campaign configuration captures:

- **Who** owns and manages the campaign (people and departments)
- **What** type of message is being sent (classification, risk level)
- **Where** it applies (entity, market, line of business)
- **How** messages are delivered (channels selected)
- **Customer consent** for push notifications (opt-in flags)

### AI-Assisted Configuration (POC Capability)

The POC includes an intelligent assistant that guides users through the field configuration process:

- **Module-by-module guidance**: The assistant walks users through each module in sequence (Basic Info → Extension Info → Channel Selection → Opt-In Flag → ...), ensuring all required fields are completed before advancing.
- **Minimal conversation rounds**: The assistant collects the maximum amount of information per interaction, reducing back-and-forth exchanges needed to complete configuration.
- **Contextual field prompting**: The assistant understands field dependencies and only prompts for fields that are relevant given the current configuration (e.g., it will not ask for PUSH opt-in flags if no PUSH channel is selected).
- **Reference use cases**: The assistant can reference historical campaign configurations to pre-fill fields where patterns match.

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

### 4.3 Channel Selection

**Module Purpose**: This section covers only the `channel` field — the primary selection that determines which delivery channels (SMS, EMAIL, PUSH, LETTER) will be used for the campaign. The full Delivery Channel configuration (sender, priority, traffic split, etc.) is covered in the complete POC BRD.

| # | Field Name | Display Name | Business Description | Required | Options / Enum | Provided By | Dependencies |
|---|-----------|--------------|---------------------|----------|----------------|-------------|--------------|
| 28 | `channel` | Delivery Channel | Selected delivery channel(s) for the campaign | ✅ Required | `SMS`, `EMAIL`, `PUSH`, `LETTER` | Business | — |

**Total fields**: 1 (1 Required)

> **Important**: The `channel` field is a **master dependency driver**. Selecting one or more channels activates specific fields in the Opt-In Flag and Bounce Back modules. See [Section 5.1](#51-channel-driven-field-visibility) for the full activation matrix.

---

### 4.4 Opt-In Flag

**Module Purpose**: Manages customer opt-in preferences for push notification channels. These flags determine whether a customer has consented to receive specific types of push notifications.

| # | Field Name | Display Name | Business Description | Required | Options / Enum | Provided By | Dependencies |
|---|-----------|--------------|---------------------|----------|----------------|-------------|--------------|
| 29 | `push_optin_flag` | Master | Opt-in master flag | ⬜ Optional / Generated | Boolean | Business | 📌 Depends on `PUSH` channel |
| 30 | `marketing_optin_flag` | Marketing | Push marketing opt-in flag | ⬜ Optional / Generated | Boolean | Business | 📌 Depends on `PUSH` + `app_name` |
| 31 | `high_risk_push_optin_flag` | High Risk | Push high risk opt-in flag | ⬜ Optional / Generated | Boolean | Business | 📌 Depends on `PUSH` DAASC |

**Total fields**: 3 (all Optional / Generated)

**Opt-In Flag Hierarchy:**
```
Master Opt-in (push_optin_flag)
├── Marketing Opt-in (marketing_optin_flag)
└── High Risk Opt-in (high_risk_push_optin_flag)
```

> **Note**: Opt-In Flag fields are **only relevant when the PUSH channel is selected**. They are auto-generated based on channel and sub-path selections.

---

## 5. Field Dependencies & Relationships

### 5.1 Channel-Driven Field Visibility

The `channel` field drives visibility across the Opt-In Flag module and other modules not fully covered in this BRD. Below is the complete activation matrix.

#### Channel → Activated Fields (This BRD Scope)

| Field | SMS | EMAIL | PUSH | LETTER |
|-------|:---:|:-----:|:----:|:------:|
| **Opt-In Flag** | | | | |
| `push_optin_flag` | — | — | ✅ | — |
| `marketing_optin_flag` | — | — | ✅ | — |
| `high_risk_push_optin_flag` | — | — | ✅ | — |

#### Channel → Activated Fields (Full System Reference)

The following matrix shows all fields activated by each channel, including those covered in the full BRD but **not in this document's scope**.

| Field | SMS | EMAIL | PUSH | LETTER | Module (Full BRD) |
|-------|:---:|:-----:|:----:|:------:|:-----------------:|
| `priority` | ✅ | ✅ | ✅ | ✅ | Delivery Channel |
| `send_to_china_flag` | ✅ | | | | Delivery Channel |
| `traffic_percentage` | ✅ | ✅ | ✅ | | Delivery Channel |
| `sender` | ✅ | ✅ | | | Delivery Channel |
| `sender_name` | | ✅ | | | Delivery Channel |
| `cost_center_id` | ✅ | | | | Delivery Channel |
| `encrypt_type` | | ✅ | | | Delivery Channel |
| `app_name` | | | ✅ | | Delivery Channel |
| `push_optin_flag` | | | ✅ | | Opt-In Flag ✅ |
| `marketing_optin_flag` | | | ✅ | | Opt-In Flag ✅ |
| `high_risk_push_optin_flag` | | | ✅ | | Opt-In Flag ✅ |
| `bounce_back` | | | ✅ | | Bounce Back |
| `sms_bounce_back_period` | ✅ | | | | Bounce Back |
| `email_bounce_back_period` | | ✅ | | | Bounce Back |
| `push_bounce_back_period` | | | ✅ | | Bounce Back |
| `letter_bounce_back_success_flag` | | | | ✅ | Bounce Back |
| `letter_bounce_back_period` | | | | ✅ | Bounce Back |

#### Channel Dependency Flowchart

```
                        ┌─────────────────────┐
                        │  Channel Selected?   │
                        │  (channel field)     │
                        └──────────┬──────────┘
                                   │
          ┌────────────┬───────────┼───────────┬────────────┐
          ▼            ▼           ▼           ▼            │
      ┌───────┐   ┌────────┐  ┌────────┐  ┌─────────┐     │
      │  SMS  │   │ EMAIL  │  │  PUSH  │  │ LETTER  │     │
      └───────┘   └────────┘  └───┬────┘  └─────────┘     │
                                  │                         │
                                  ▼                         │
                        ┌─────────────────────┐            │
                        │    OPT-IN FLAG       │            │
                        │    MODULE            │            │
                        │                     │            │
                        │ ┌─────────────────┐ │            │
                        │ │ push_optin_flag │ │            │
                        │ │ (Master Opt-in) │ │            │
                        │ └────────┬────────┘ │            │
                        │          │          │            │
                        │    ┌─────┴──────┐   │            │
                        │    ▼            ▼   │            │
                        │ ┌──────────┐ ┌────────────────┐  │
                        │ │marketing │ │high_risk_push  │  │
                        │ │_optin_   │ │_optin_flag     │  │
                        │ │flag      │ │                │  │
                        │ │(needs    │ │(PUSH DAASC)    │  │
                        │ │ app_name)│ │                │  │
                        │ └──────────┘ └────────────────┘  │
                        └─────────────────────┘            │
                                                           │
                        ┌──────────────────────────────────┘
                        │
                        │  Other modules activated by channels:
                        │  (covered in full POC BRD)
                        │
                        ▼
              ┌────────────────────────┐
              │  Delivery Channel      │
              │  Module (full BRD)     │
              │  • sender, priority    │
              │  • traffic_percentage  │
              │  • channel-specific    │
              │    config              │
              └────────────────────────┘
              ┌────────────────────────┐
              │  Bounce Back           │
              │  Module (full BRD)     │
              │  • bounce_back periods │
              │  • fallback routing    │
              └────────────────────────┘
```

---

### 5.2 Cross-Field Value Dependencies

Some fields become visible, required, or change behavior based on the **value** of another field.

#### Value Dependency Matrix

| Target Field | Depends On | Condition | Effect |
|-------------|-----------|-----------|--------|
| `delivery_schedule_other` | `delivery_schedule` | = `No` | Field becomes visible and required |
| `support_dual_vendor` | `high_risk_flag` | = `Yes` | **Must** be `Yes` (business rule) |
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

**3. Opt-In Flag Dependency Chain:**

```
                    ┌─────────────────────┐
                    │  PUSH Channel?      │
                    │  (channel includes  │
                    │   PUSH)             │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
                  Yes                    No
                    │                     │
                    ▼                     ▼
           ┌─────────────────┐    ┌─────────────────┐
           │ push_optin_flag │    │ Opt-In fields   │
           │ (Master)        │    │ NOT applicable  │
           │ VISIBLE         │    │ (hidden)        │
           └────────┬────────┘    └─────────────────┘
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
  ┌───────────────┐   ┌──────────────────────┐
  │ marketing_    │   │ high_risk_push_      │
  │ optin_flag    │   │ optin_flag           │
  │               │   │                      │
  │ VISIBLE when: │   │ VISIBLE when:        │
  │ PUSH selected │   │ PUSH selected        │
  │ AND app_name  │   │ (DAASC path)         │
  │ has value     │   │                      │
  └───────────────┘   └──────────────────────┘
```

---

### 5.3 Cross-Module Dependencies

Fields in one module can affect fields in another module.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CROSS-MODULE DEPENDENCY MAP                          │
│                    (This POC BRD Scope)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────┐                                                     │
│  │   Basic Info    │                                                     │
│  │                │                                                     │
│  │ service_line ──┼──────────┐                                          │
│  │ (Servicing/    │          │                                          │
│  │  Marketing)    │          │                                          │
│  └────────────────┘          │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────┐                            │
│  │           Extension Info                 │                            │
│  │                                         │                            │
│  │ high_risk_flag ─────────────────────┐   │                            │
│  │                                     │   │                            │
│  │ delivery_schedule ──▶ other schedule│   │                            │
│  │                         (if = No)   │   │                            │
│  │                                     │   │                            │
│  │ app_name (from Delivery Channel) ───┼───┼───┐                        │
│  │                                     │   │   │                        │
│  └─────────────────────────────────────┘   │   │                        │
│                                            │   │                        │
│                              ┌─────────────┘   │                        │
│                              ▼                 ▼                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Channel Selection                            │   │
│  │                                                                 │   │
│  │                     channel (SMS/EMAIL/PUSH/LETTER)             │   │
│  │                                                                 │   │
│  └────────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│                    ┌──────────────┴──────────────┐                     │
│                    ▼                             ▼                     │
│  ┌─────────────────────────┐   ┌─────────────────────────────────┐    │
│  │     Opt-In Flag          │   │  Other Modules (full POC BRD)   │    │
│  │                         │   │                                 │    │
│  │ push_optin_flag ◀───────┤   │  Delivery Channel:              │    │
│  │  (if PUSH selected)     │   │   sender, priority, traffic_%   │    │
│  │                         │   │                                 │    │
│  │ marketing_optin_flag ◀──┤   │  Bounce Back:                   │    │
│  │  (if PUSH + app_name)   │   │   bounce_back periods           │    │
│  │                         │   │   fallback routing              │    │
│  │ high_risk_push_optin ◀──┤   │                                 │    │
│  │  (if PUSH DAASC)        │   │                                 │    │
│  │                         │   │                                 │    │
│  └─────────────────────────┘   └─────────────────────────────────┘    │
│                                                                         │
│  Legend: ───▶ activates/enables    ◀──── depends on                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Cross-Module Relationships (This BRD):**

| Source Module | Source Field | Target Module | Target Field | Relationship |
|--------------|-------------|--------------|-------------|--------------|
| Basic Info | `service_line` | Extension Info | `regulatory_requirement` | Recommended if Servicing |
| Extension Info | `high_risk_flag` | Extension Info | `support_dual_vendor` | Must be Yes if high-risk |
| Extension Info | `delivery_schedule` | Extension Info | `delivery_schedule_other` | Visible if schedule = No |
| Channel Selection | `channel` = PUSH | Opt-In Flag | `push_optin_flag` | Activates field |
| Channel Selection | `channel` = PUSH | Opt-In Flag | `marketing_optin_flag` | Activates (needs app_name) |
| Channel Selection | `channel` = PUSH | Opt-In Flag | `high_risk_push_optin_flag` | Activates field |

---

## 6. Data Architecture

### Simplified ERD (Business Field Names)

The fields covered in this BRD are stored across **2 database tables**.

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
│   │  ┌──────────────────┐  ┌──────────────────┐                             │   │
│   │  │ is_dual_channel  │  │ push_optin_flag  │                             │   │
│   │  │ (Is Dual Channel)│  │ (Master Opt-in)  │                             │   │
│   │  └──────────────────┘  └──────────────────┘                             │   │
│   │                                                                         │   │
│   │  ┌──────────────────┐  ┌──────────────────┐                             │   │
│   │  │ marketing_optin  │  │ high_risk_push_  │                             │   │
│   │  │  _flag           │  │  optin_flag      │                             │   │
│   │  │ (Marketing)      │  │ (High Risk)      │                             │   │
│   │  └──────────────────┘  └──────────────────┘                             │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
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
└─────────────────────────────────────────────────────────────────────────────────┘

Note: The `channel` field and other Delivery Channel fields are stored in
      tbl_use_case_channel_rule (see full POC BRD for details).
```

### Table Relationships Summary

| Table | Fields in This BRD | Purpose |
|-------|-------------------|---------|
| `tbl_use_case` | 15 fields | Core campaign identity, classification, and opt-in flags |
| `tbl_use_case_ext` | 16 fields | Extended details: ownership, journeys, business context |
| *(not in scope)* | — | `tbl_use_case_channel_rule` — channel-specific config (see full POC BRD) |

---

## 7. Validation Rules & Business Rules

### 7.1 Field Requirement Rules

| Rule ID | Field(s) | Rule Type | Rule Description |
|---------|----------|-----------|-----------------|
| VR-01 | `group_member`, `country_code`, `line_of_business`, `use_case_name`, `project_name`, `source_system`, `service_line` | Required | Must be filled before completing Basic Info module |
| VR-02 | `message_owner`, `delivery_schedule`, `high_risk_flag` | Required | Must be filled before completing Extension Info module |
| VR-03 | `channel` | Required | At least one delivery channel must be selected |
| VR-04 | `depart_head`, `team_head`, `business_line_1st_level`, `business_line_2nd_level`, `cost_owner` | Required by UI | Displayed in form; strongly recommended to fill |

### 7.2 Conditional Visibility Rules

| Rule ID | Target Field | Condition | Behavior |
|---------|-------------|-----------|----------|
| CV-01 | `delivery_schedule_other` | `delivery_schedule` = `No` | Field becomes visible and required |
| CV-02 | `push_optin_flag` | PUSH channel selected | Field becomes visible |
| CV-03 | `marketing_optin_flag` | PUSH channel selected AND `app_name` has value | Field becomes visible |
| CV-04 | `high_risk_push_optin_flag` | PUSH channel selected (DAASC path) | Field becomes visible |

### 7.3 Business Logic Rules

| Rule ID | Rule Name | Description | Affected Fields |
|---------|-----------|-------------|-----------------|
| BR-01 | High-Risk Dual Vendor | If `high_risk_flag` = `Yes`, then `support_dual_vendor` **must** be `Yes` | `high_risk_flag`, `support_dual_vendor` |
| BR-02 | Regulatory + Service Line | If `service_line` = `Servicing`, `regulatory_requirement` is recommended to be filled | `regulatory_requirement` |
| BR-03 | PUSH Opt-in Master | If PUSH channel is selected, `push_optin_flag` (master) must be addressed | `push_optin_flag` |
| BR-04 | Line of Business Edit Lock | `line_of_business` is only editable during campaign creation, not in edit mode | `line_of_business` |
| BR-05 | Opt-In Flag Scope | Opt-In Flag fields are only applicable when PUSH channel is selected; if PUSH is not selected, these fields are not relevant | All Opt-In Flag fields |

### 7.4 Value Constraint Rules

| Rule ID | Field | Constraint | Description |
|---------|-------|-----------|-------------|
| — | (No value constraints in this BRD scope) | — | Value constraints for traffic_percentage, bounce back periods, etc. are in the full POC BRD |

---

## 8. Field Metadata

### 8.1 Provided By Summary

| Provider Role | Fields Count | Typical Fields |
|--------------|-------------|----------------|
| Business | 25 | Most fields; primary owner of campaign configuration |
| Business / IT PM | 2 | `project_name`, `downstream_name` |
| Business / IT PM / Source System IT | 1 | `source_system` |
| Business / IT PM / Downstream System IT | 1 | `downstream_name` |
| Business / IT (if any) | 1 | `remarks` |

### 8.2 DB Table Mapping Summary

| Table | Fields in This BRD | Modules Covered |
|-------|-------------------|-----------------|
| `tbl_use_case` | 15 | Basic Info (6), Extension Info (6), Opt-In Flag (3) |
| `tbl_use_case_ext` | 16 | Basic Info (1), Extension Info (15) |
| *(no table)* | 1 | Extension Info (`delivery_schedule_other`) |

### 8.3 Complete Field Count by Module (This BRD)

| Module | Required | Required by UI | Conditional | Optional | Total |
|--------|----------|---------------|-------------|----------|-------|
| Basic Info | 7 | 0 | 0 | 1 | 8 |
| Extension Info | 4 | 5 | 0 | 10 | 19 |
| Channel Selection | 1 | 0 | 0 | 0 | 1 |
| Opt-In Flag | 0 | 0 | 0 | 3 | 3 |
| **Total** | **12** | **5** | **0** | **14** | **31** |

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
| **Partial Scope** | This document covers only 31 of 48 fields | Delivery Channel and Bounce Back modules require separate review |

### Future Considerations

| Area | Recommendation |
|------|---------------|
| **Production Data Model** | Validate ERD with database team; consider indexing strategy |
| **AI Training** | Expand training data with real historical campaigns |
| **Validation Engine** | Implement server-side validation for all business rules |
| **Integration** | Design APIs for MDC, CUS, and downstream system integration |
| **Audit Trail** | Add change tracking for compliance requirements |
| **Full Module Coverage** | Review Delivery Channel and Bounce Back modules in full POC BRD |
| **Multi-language** | Support Traditional Chinese, Simplified Chinese, English |

---

*End of POC BRD — Basic Info, Extension Info, Channel Selection & Opt-In Flag*
