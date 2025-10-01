import { useState, useEffect } from 'react';
import { AudioDiagnostics } from '@/utils/audio-diagnostics';
import { AlertCircle, CheckCircle, Mic, Volume2, Settings, Speaker, MicOff } from 'lucide-react';

const AudioTroubleshooter = ({ isOpen, onClose, onFixApplied, audioDevices, selectedAudioInput, selectedAudioOutput, switchAudioInput, switchAudioOutput }) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const audioDiag = new AudioDiagnostics();
      const results = await audioDiag.performFullDiagnostic();
      setDiagnostics(results);
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setDiagnostics({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const testMicrophone = async () => {
    try {
      setIsMonitoring(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Monitor audio levels
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      source.connect(analyser);
      
      const checkLevel = () => {
        if (!isMonitoring) {
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          return;
        }
        
        analyser.getByteFrequencyData(dataArray);
        const level = Math.max(...dataArray);
        setAudioLevel(level);
        requestAnimationFrame(checkLevel);
      };
      
      checkLevel();
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        setIsMonitoring(false);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        setAudioLevel(0);
      }, 10000);
      
    } catch (error) {
      console.error('Microphone test failed:', error);
      setIsMonitoring(false);
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setAudioLevel(0);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusIcon = (status) => {
    if (status === true || status?.success === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (status) => {
    if (status === true || status?.success === true) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Audio Troubleshooter
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {isRunning ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running audio diagnostics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Microphone Test */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Microphone Test
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={isMonitoring ? stopMonitoring : testMicrophone}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isMonitoring
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isMonitoring ? 'Stop Test' : 'Test Microphone'}
                </button>
                
                {isMonitoring && (
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-green-500 h-full transition-all duration-100"
                        style={{ width: `${Math.min((audioLevel / 255) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {audioLevel > 0 ? '🎤 Audio detected!' : '🔇 No audio detected'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic Results */}
            {diagnostics && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Diagnostic Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(diagnostics.permissions?.granted)}
                      <span className={`font-medium ${getStatusColor(diagnostics.permissions?.granted)}`}>
                        Microphone Permission
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {diagnostics.permissions?.granted ? 'Granted' : 'Not granted'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(diagnostics.devices?.inputDevices > 0)}
                      <span className={`font-medium ${getStatusColor(diagnostics.devices?.inputDevices > 0)}`}>
                        Audio Devices
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {diagnostics.devices?.inputDevices || 0} microphone(s) found
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(diagnostics.browser?.getUserMedia)}
                      <span className={`font-medium ${getStatusColor(diagnostics.browser?.getUserMedia)}`}>
                        Browser Support
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {diagnostics.browser?.getUserMedia ? 'WebRTC supported' : 'WebRTC not supported'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(diagnostics.constraints?.success)}
                      <span className={`font-medium ${getStatusColor(diagnostics.constraints?.success)}`}>
                        Audio Quality
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {diagnostics.constraints?.success ? 'Optimal settings applied' : 'Issues with audio settings'}
                    </p>
                  </div>
                </div>

                {/* Network Info */}
                {diagnostics.network && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Network Information
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>Connection: {diagnostics.network.effectiveType}</p>
                      <p>Latency: {diagnostics.network.rtt}ms</p>
                      <p>Bandwidth: {diagnostics.network.downlink} Mbps</p>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {diagnostics.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Issues Found</h4>
                    <p className="text-sm text-red-700">{diagnostics.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Device Selection */}
            {audioDevices && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Audio Device Selection</h3>
                
                {/* Microphone Selection */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Microphone
                  </h4>
                  <select 
                    value={selectedAudioInput}
                    onChange={(e) => switchAudioInput && switchAudioInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={!switchAudioInput}
                  >
                    <option value="default">Default Microphone</option>
                    {audioDevices.inputs?.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Speaker Selection */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Speaker className="w-4 h-4" />
                    Speaker/Headphones
                  </h4>
                  <select 
                    value={selectedAudioOutput}
                    onChange={(e) => switchAudioOutput && switchAudioOutput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={!switchAudioOutput}
                  >
                    <option value="default">Default Speaker</option>
                    {audioDevices.outputs?.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.substring(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={async () => {
                      try {
                        // Test speaker output with a beep sound
                        const audio = new Audio();
                        const beepDataUrl = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAYAzuJ0+/QgTIGHm7A7+OZSA0PVajh8bllHgg2jdXzzn0vBSF+yO/eizEIGGS57OScTgwOUarm7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwO";
                        audio.src = beepDataUrl;
                        audio.volume = 0.3;
                        
                        if (selectedAudioOutput !== 'default' && audio.setSinkId) {
                          await audio.setSinkId(selectedAudioOutput);
                        }
                        
                        await audio.play();
                        console.log('🔊 Speaker test completed');
                      } catch (error) {
                        console.error('❌ Speaker test failed:', error);
                      }
                    }}
                    className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    disabled={!switchAudioOutput}
                  >
                    Test Speaker
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={runDiagnostics}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                Run Diagnostics Again
              </button>
              <button
                onClick={() => {
                  if (onFixApplied) onFixApplied();
                  onClose();
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                Apply Fixes & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTroubleshooter;