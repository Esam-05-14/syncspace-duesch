# Implementation waves

| Wave | Status in this repo | Stop evidence |
| --- | --- | --- |
| S0 | Done (freeze recorded) | Version shortlist; conflict policy; schema `1.0.0` |
| S1 | First slice running locally | Create / edit / reload a local or sample board |
| S2 | Recorded in Node (not two browser profiles) | Two isolated Y.Doc clients; invalid token rejected |
| S3 | Binary SQLite + restart restore recorded | Checkpoint restore without an open peer |
| S4 | Article-recall + NFC tests | Draft not claimed reviewed |
| S5 | Two isolated personal IndexedDB profiles; shared export has no review fields | Browser-profile UI walkthrough still optional |
| S6 | Export, import, forget, token rotation on reconnect | Backup restore; unauthorized reconnect denied |
| S7 | Fresh-clone audit recorded | No committed tokens or sqlite data |

When time is tight, extra exercise modes and canvas decoration drop first. Offline proof, privacy separation, and the study loop do not.
