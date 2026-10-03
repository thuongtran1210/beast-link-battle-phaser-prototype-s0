# P1-V14A — Multi-Wave Run Structure

Status: Experimental / not adopted.

The run controller owns three deterministic waves: Frontline Pressure, Backline Dive, and Protected Ranged. It selects an existing immutable fixture for each wave and then creates the ordinary single-battle `AutonomousBattleModel`; wave logic never enters the model.

A non-final win shows Wave Result and only increments the wave when Continue is selected. A final-wave win and any loss show Final Result. Beginning the next wave resets the Beast Queue, Energy Queue, formation, battle model, metrics, and all battle-local signature runtime by constructing a fresh battle later in that wave's setup.

V14B, V14C, and V14D are not started.
