// Tidy Troop SFX — non-pitched/UI cues via /build-sfx presets.
// Outputs to Assets/GeneratedSFX/.
const path = require('path');
const fs = require('fs');
const ENGINE = 'E:/Work/Hackathons/learn ar with specs/lens/.kiro/skills/build-sfx/tools';
const audio = require(ENGINE);
const PROJECT_ASSETS_SFX = 'E:/Work/Hackathons/learn ar with specs/lens/Assets/GeneratedSFX';
fs.mkdirSync(PROJECT_ASSETS_SFX, { recursive: true });

const p = audio.sfx_presets;

function write(name, buf) {
    audio.mix_bus.masterChain(buf, { normalize: 'peak' });
    audio.WavBuilder.write(buf, path.join(PROJECT_ASSETS_SFX, name + '.wav'));
    console.log('wrote', name);
}

// Character card pick — soft physical click.
write('PickClick', p.uiClick({ character: 'soft' }));

// Item snaps into its place — soft wooden thock.
write('SnapPlace', p.impact({ material: 'wood', size: 0.35 }));

// Out-of-view hint — gentle two-bell ding-dong.
write('HintChime', p.uiNotify());

// Ending sparkles — shimmer cloud.
write('SparkleShimmer', p.sparkle({ duration: 2.5 }));
