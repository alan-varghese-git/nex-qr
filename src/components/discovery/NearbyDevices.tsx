import React, { useEffect, useState, useRef } from 'react';
import { Radar, Smartphone, Send, X, Wifi, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { nanoid } from 'nanoid';

// Fun random name generator
const ADJECTIVES = ['Neon', 'Happy', 'Clever', 'Brave', 'Swift', 'Silent', 'Cosmic', 'Turbo', 'Crypto', 'Laser'];
const NOUNS = ['Falcon', 'Tiger', 'Ninja', 'Robot', 'Dragon', 'Phoenix', 'Panther', 'Wizard', 'Ghost', 'Rider'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

const generateDeviceName = () => {
  return `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
};
const generateColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

interface Device {
  id: string;
  name: string;
  color: string;
  isSelf?: boolean;
}

interface SharedData {
  fromName: string;
  fromColor: string;
  text: string;
  timestamp: number;
}

const NearbyDevices = () => {
  const [publicIp, setPublicIp] = useState<string | null>(null);
  const [ipError, setIpError] = useState<string | null>(null);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [message, setMessage] = useState('');
  const [receivedData, setReceivedData] = useState<SharedData | null>(null);
  
  // Self identity
  const [self] = useState<Device>({
    id: nanoid(),
    name: generateDeviceName(),
    color: generateColor(),
    isSelf: true
  });
  
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Fetch public IP to use as a "room" identifier for local network
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        if (data.ip) {
          setPublicIp(data.ip);
        } else {
          setIpError('Could not determine local network identifier.');
        }
      } catch (error) {
        console.error('Failed to fetch IP', error);
        setIpError('Failed to connect to discovery service. Please check your connection.');
      }
    };
    
    fetchIp();
  }, []);

  useEffect(() => {
    if (!publicIp || !isOptedIn) return;

    // Room ID is based on IP but hashed/sanitized slightly to prevent raw IP logging in channel names if desired
    // Actually, just a simple prefix is fine, Supabase handles channel names securely.
    const roomId = `local-network-${publicIp.replace(/\./g, '-')}`;
    
    const channel = supabase.channel(roomId, {
      config: {
        presence: {
          key: self.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineDevices: Device[] = [];
        
        for (const key in state) {
          // Presence state arrays contain objects pushed by each client
          const presences = state[key] as any[];
          if (presences.length > 0) {
            const presence = presences[0];
            onlineDevices.push({
              id: key,
              name: presence.name,
              color: presence.color,
              isSelf: key === self.id
            });
          }
        }
        
        setDevices(onlineDevices);
      })
      .on('broadcast', { event: 'share_data' }, (payload) => {
        const data = payload.payload;
        // Check if this message was meant for us
        if (data.targetId === self.id) {
          setReceivedData({
            fromName: data.fromName,
            fromColor: data.fromColor,
            text: data.text,
            timestamp: Date.now()
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: self.name,
            color: self.color,
            onlineAt: new Date().toISOString(),
          });
        }
      });
      
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [publicIp, isOptedIn, self]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice || !message.trim() || !channelRef.current) return;
    
    await channelRef.current.send({
      type: 'broadcast',
      event: 'share_data',
      payload: {
        targetId: selectedDevice.id,
        fromName: self.name,
        fromColor: self.color,
        text: message
      }
    });
    
    setMessage('');
    setSelectedDevice(null);
    // Optionally show a "Sent" toast here
  };

  const handleCopy = () => {
    if (receivedData?.text) {
      navigator.clipboard.writeText(receivedData.text);
      setReceivedData(null);
    }
  };

  // UI States
  if (ipError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Discovery Failed</h2>
        <p className="text-muted-foreground">{ipError}</p>
      </div>
    );
  }

  if (!publicIp) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Initializing network radar...</p>
      </div>
    );
  }

  if (!isOptedIn) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-card border rounded-2xl p-8 text-center shadow-lg">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Radar className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Local Network Discovery</h2>
          <p className="text-muted-foreground mb-6">
            Discover other devices on your current Wi-Fi network to instantly share links, text, and QR data peer-to-peer.
          </p>
          <div className="bg-muted/50 p-4 rounded-xl text-sm text-left mb-8">
            <p className="flex items-start gap-2 text-muted-foreground">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              By opting in, your device will become visible to others on your local network using a random alias <strong>({self.name})</strong>.
            </p>
          </div>
          <button 
            onClick={() => setIsOptedIn(true)}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95"
          >
            Enable Discovery
          </button>
        </div>
      </div>
    );
  }

  const otherDevices = devices.filter(d => !d.isSelf);

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md relative" style={{ backgroundColor: self.color }}>
            {self.name.charAt(0)}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">You appear as</p>
            <h3 className="text-lg font-bold">{self.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border">
          <Wifi className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{publicIp}</span>
        </div>
      </div>

      {/* Radar View */}
      <div className="bg-card border rounded-2xl p-8 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Radar className="text-primary animate-pulse" /> Radar
          </h2>
          <p className="text-muted-foreground">Looking for devices on your network...</p>
        </div>

        {/* The Grid of Devices */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          {otherDevices.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground pt-10">
              <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-primary/20 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <Radar className="w-10 h-10 text-primary" />
              </div>
              <p>No other devices found on this network yet.</p>
              <p className="text-sm mt-1">Open NexQR on another device connected to this Wi-Fi.</p>
            </div>
          ) : (
            otherDevices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-transparent hover:border-primary/30 hover:bg-muted/30 transition-all hover:scale-105"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-active:scale-95" style={{ backgroundColor: device.color }}>
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{device.name}</p>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Send Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: selectedDevice.color }}>
                  {selectedDevice.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm">Send to {selectedDevice.name}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedDevice(null)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSend} className="p-4 space-y-4">
              <textarea
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message, URL, or paste QR data..."
                className="w-full p-3 border rounded-xl bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-colors min-h-[120px] resize-none"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedDevice(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!message.trim()} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal / Toast */}
      {receivedData && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="p-6 text-center space-y-4 relative">
              <button onClick={() => setReceivedData(null)} className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto" style={{ backgroundColor: receivedData.fromColor }}>
                {receivedData.fromName.charAt(0)}
              </div>
              
              <div>
                <h3 className="font-bold text-lg">{receivedData.fromName} shared data</h3>
                <p className="text-xs text-muted-foreground">Just now via Local Network</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-xl text-left border">
                <p className="whitespace-pre-wrap break-all text-sm font-medium">{receivedData.text}</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button onClick={() => setReceivedData(null)} className="flex-1 px-4 py-3 border font-medium rounded-xl hover:bg-muted transition-colors">
                  Dismiss
                </button>
                <button onClick={handleCopy} className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md">
                  Copy & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NearbyDevices;
