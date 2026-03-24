// src/lib/init.js

// ------------------------------------------------------------
// INIT — instantiate all managers and load initial data
// Importing a manager triggers its constructor, which registers
// event listeners. Order matters: DataManager must exist before
// any manager that reads from it at startup.
// ------------------------------------------------------------

import { sleepManager }  from '../managers/SleepManager'
import { logManager }    from '../managers/LogManager'
import { deviceManager } from '../managers/DeviceManager'
import { orbManager }    from '../managers/OrbManager'
import { soundManager }  from '../managers/SoundManager'

// Load initial sleep records (first 4 — rest revealed after device sync)
sleepManager.loadRecords()
