# Implementation waves

| Wave | Status in this repo | Stop evidence |
| --- | --- | --- |
| S0 | Done (freeze recorded) | Version shortlist; conflict policy; schema `1.0.0` |
| S1 | First slice running locally | Create / edit / reload a local or sample board |
| S2 | Shared path present; two-profile test not recorded | Two isolated clients; invalid token rejected |
| S3 | Binary SQLite + inspector present; crash/restart spike not recorded | Checkpoint + inspector uses real events |
| S4 | Article-recall + NFC tests | Draft not claimed reviewed |
| S5 | Private review store in this profile | Two-profile leakage test still required |
| S6 | Partial (export/forget UI) | Backup restore; unauthorized reconnect denied |
| S7 | Not started | Fresh-clone audit later |

When time is tight, extra exercise modes and canvas decoration drop first. Offline proof, privacy separation, and the study loop do not.
