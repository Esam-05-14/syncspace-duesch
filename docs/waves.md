# Implementation waves

| Wave | Status in this repo | Stop evidence |
| --- | --- | --- |
| S0 | Done (freeze recorded) | Version shortlist; conflict policy; schema `1.0.0` |
| S1 | First slice running locally | Create / edit / reload a local or sample board |
| S2 | Recorded in Node (not two browser profiles) | Two isolated Y.Doc clients; invalid token rejected |
| S3 | Binary SQLite + restart restore recorded | Checkpoint restore without an open peer |
| S4 | Article-recall + NFC tests | Draft not claimed reviewed |
| S5 | Private review store in this profile; shared export has no review fields | Two browser-profile leakage test still required |
| S6 | Partial (export/forget UI) | Backup restore; unauthorized reconnect denied |
| S7 | Not started | Fresh-clone audit later |

When time is tight, extra exercise modes and canvas decoration drop first. Offline proof, privacy separation, and the study loop do not.
