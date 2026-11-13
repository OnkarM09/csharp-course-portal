# C# Masterclass — Production Documentation Portal

[![.NET 9 / C# 13](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![C# Version](https://img.shields.io/badge/C%23-13.0-239120?logo=csharp)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![Zero Build Step](https://img.shields.io/badge/Build%20Step-Zero%20(Offline%20First)-38BDF8)](#offline-first)
[![Sections](https://img.shields.io/badge/Curriculum-37%20Sections-818CF8)](#curriculum-architecture)

A comprehensive, production-grade, offline-first static documentation portal covering the entire **C# Masterclass** curriculum (from language fundamentals through C# 9, 10, 11, 12, 13, and 14 evolution).

---

## ⚡ Key Highlights

* **100% Offline-First:** Pure vanilla HTML5, CSS3, and JavaScript. No npm, webpack, or external CDNs required. Double-click `index.html` to browse immediately.
* **Instant Global Search (`Ctrl+K`):** Client-side fuzzy keyword search across all 37 sections and 126 subtopics with smooth auto-scroll to topic anchors (`#hash`).
* **Collapsible / Expandable Left Sidebar:** One-click toggle button to collapse the sidebar into a wide reading view, with state persisted via `localStorage`.
* **Dark / Light Theme:** Toggle with persistent user preferences.
* **Deep Architectural Enrichment:**
  * 🔵 **Core Concepts (Notes):** Step-by-step intuitive explanations and real-world analogies.
  * 🟣 **Under the Hood / Compiler Lowering:** Roslyn lowering for `var`, `lock`, top-level statements, async state machines, and records.
  * 📊 **Memory Diagrams:** ASCII/Unicode memory layouts for Stack vs Heap, Boxing/Unboxing, Object Headers, and Generational GC.
  * 🟢 **Best Practices & Real-World Tips.**
  * 🟠 **Compiler Gotchas & Traps:** Sync-over-async deadlocks, multiple LINQ enumerations, floating-point precision traps, etc.
  * **1-Click Copy Code:** Preformatted, syntax-highlighted C# snippets.

---

## 🏗️ Curriculum Architecture

| Module | Focus Area | Sections Included |
| :--- | :--- | :--- |
| **Module 1** | Foundations & Architecture | Sec 01–03 (.NET Architecture, CLR, JIT, BCL, Language Basics, CLI Tooling) |
| **Module 2** | Object-Oriented Fundamentals | Sec 04–09 (OOP, Fields, Methods, Casting, Constructors, Properties) |
| **Module 3** | Class Design & Type System | Sec 10–15 (Inheritance, Abstract Classes, Interfaces, Namespaces, Structs, System.Object) |
| **Module 4** | Language Plumbing & Memory | Sec 16–19 (Generics, Null Handling, Extension Methods, Pattern Matching, Garbage Collection & IDisposable) |
| **Module 5** | Functional Constructs & Data | Sec 20–25 (Delegates, Events, Arrays, Collections, Anonymous Types, Tuples, LINQ) |
| **Module 6** | Base Class Library & Resilience | Sec 26–29 (String/DateTime/Math, File I/O & Streams, Serialization, Exception Handling) |
| **Module 7** | Concurrency & Async | Sec 31–33 (Threading, Synchronization, Tasks/TPL, Async/Await State Machines) |
| **Module 8** | Modern C# Evolution | Sec 30, 34–37 (C# 9 Records, C# 11 Required/Generic Math, C# 12 Primary Constructors, C# 13 Lock/params Span, C# 14 Roadmap) |

---

## 🚀 How to Browse

Simply open `index.html` in any web browser:
\`\`\`bash
# Double-click index.html or launch via terminal
start index.html
\`\`\`

---

## 📄 License
MIT License. Created for the C# Masterclass curriculum.
