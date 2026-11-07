// Tidy Troop jingles — pitched cues via /build-music.
//  SaluteBugle: short "ta-daa" brass call that plays with each salute (~1.2 s).
//  Fanfare:     short triumphant ending fanfare (~4 s) for "Room fresh! 10 of 10".
const path = require('path');
const fs = require('fs');
const m = require('E:/Work/Hackathons/learn ar with specs/lens/.kiro/skills/build-music/tools');
const PROJECT_ASSETS_SFX = 'E:/Work/Hackathons/learn ar with specs/lens/Assets/GeneratedSFX';
fs.mkdirSync(PROJECT_ASSETS_SFX, { recursive: true });

function ev(time, beats, value, velocity) { return { time, beats, value, velocity }; }

// ---- Salute bugle: G4 pickup -> C5 held, with a light snare tap -------------
{
    const bpm = 132;
    const brass = [ev(0, 0.35, 67, 92), ev(0.5, 1.6, 72, 108)];
    const harmony = [ev(0.5, 1.6, 64, 70)];          // E4 under the C5 for warmth
    const tap = [ev(0, 0.25, 38, 70), ev(0.5, 0.25, 38, 95)];
    const tracks = [
        m.track('bugle', 'analogBrass', brass, { fx: { hpf: 180, reverb: 'smallRoom', gain: 0.8 } }),
        m.track('harm', 'analogBrass', harmony, { fx: { hpf: 180, lpf: 3500, reverb: 'smallRoom', gain: 0.35 } }),
        m.track('snare', 'snare', tap, { fx: { hpf: 300, gain: 0.35 }, quantize: 'strict' }),
    ];
    const out = m.render(tracks, { bpm, duration: 1.6, master: { normalize: 'peak' } });
    m.WavBuilder.write(out, path.join(PROJECT_ASSETS_SFX, 'SaluteBugle.wav'));
    console.log('wrote SaluteBugle');
}

// ---- Ending fanfare: snare roll -> I-IV-V-I brass stabs + crash -------------
{
    const bpm = 120;
    const roll = [];
    for (let i = 0; i < 8; i++) roll.push(ev(i * 0.125, 0.125, 38, 55 + i * 6));
    const lead = [
        ev(1.0, 0.5, 67, 95), ev(1.5, 0.5, 67, 90), ev(2.0, 0.5, 72, 105),
        ev(2.5, 0.5, 76, 100), ev(3.0, 0.75, 74, 100), ev(3.75, 0.25, 76, 95),
        ev(4.0, 2.5, 79, 112),
    ];
    const chordsEv = [];
    const chord = (t, beats, notes, vel) => notes.forEach(n => chordsEv.push(ev(t, beats, n, vel)));
    chord(1.0, 1.0, [60, 64], 70);
    chord(2.0, 1.0, [60, 65], 70);
    chord(3.0, 1.0, [59, 62], 72);
    chord(4.0, 2.5, [60, 64, 67], 80);
    const bass = [ev(1.0, 1.0, 36, 85), ev(2.0, 1.0, 41, 85), ev(3.0, 1.0, 43, 88), ev(4.0, 2.5, 36, 95)];
    const hits = [ev(4.0, 1.0, 49, 100)];
    const kicks = [ev(1.0, 0.5, 36, 90), ev(2.0, 0.5, 36, 85), ev(3.0, 0.5, 36, 85), ev(4.0, 0.5, 36, 100)];
    const tracks = [
        m.track('roll', 'snare', roll, { fx: { hpf: 300, gain: 0.4 }, quantize: 'strict' }),
        m.track('lead', 'analogBrass', lead, { fx: { hpf: 400, reverb: 'largeHall', gain: 0.75 } }),
        m.track('stabs', 'analogBrass', chordsEv, { fx: { hpf: 200, lpf: 4000, reverb: 'mediumRoom', gain: 0.35 } }),
        m.track('bass', 'synthBass', bass, { fx: { hpf: 50, lpf: 1000, gain: 0.5 } }),
        m.track('kick', 'kick', kicks, { fx: { lpf: 6000, gain: 0.6 }, quantize: 'strict' }),
        m.track('crash', 'crash', hits, { fx: { hpf: 300, gain: 0.45 }, quantize: 'strict' }),
    ];
    const out = m.render(tracks, { bpm, duration: 4.8, master: { normalize: 'peak', glue: true, width: 1.15 } });
    m.WavBuilder.write(out, path.join(PROJECT_ASSETS_SFX, 'Fanfare.wav'));
    console.log('wrote Fanfare');
}
