// Roblox AudioWorklet Fix Patch
if (window._robloxAudioPatched) {
    alert("Audio patch is already active.");
} else {
    window._robloxAudioPatched = true;

    // AudioWorkletのグローバル登録やメッセージ処理の型不整合をフック
    const origRegister = window.registerProcessor;
    window.registerProcessor = function(name, processorCtor) {
        try {
            // プロセッサの安全性を確保するためのラッパー処理
            class SafeAudioProcessor extends processorCtor {
                constructor(options) {
                    super(options || {});
                    if (this.channelCount === undefined) {
                        this.channelCount = 2;
                    }
                }
                process(inputs, outputs, parameters) {
                    try {
                        return super.process(inputs, outputs, parameters);
                    } catch (err) {
                        return true;
                    }
                }
            }
            return origRegister ? origRegister(name, SafeAudioProcessor) : null;
        } catch (e) {
            return origRegister ? origRegister(name, processorCtor) : null;
        }
    };

    console.log("[Patched] Roblox AudioWorklet hook installed successfully.");
    alert("Robloxオーディオパッチを適用しました。ゲーム画面を再読み込みしてください。");
}
