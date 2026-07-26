import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LZString from 'lz-string';
import { Highlight, themes } from 'prism-react-renderer';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, AlertTriangle } from 'lucide-react';

const Viewer = () => {
  const [searchParams] = useSearchParams();
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const type = searchParams.get('type');
  const rawData = searchParams.get('data');
  const filename = searchParams.get('file') || 'download';

  useEffect(() => {
    if (!rawData) {
      setError('No data provided in URL.');
      return;
    }

    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(rawData);
      if (decompressed === null) {
        // Fallback for non-compressed data just in case
        setDecodedData(decodeURIComponent(rawData));
      } else {
        setDecodedData(decompressed);
      }
    } catch (err) {
      console.error("Decompression error", err);
      setError('Failed to decode payload.');
    }
  }, [rawData]);

  const handleCopy = async () => {
    if (decodedData) {
      await navigator.clipboard.writeText(decodedData);
      // Optional: Show toast
    }
  };

  const handleDownload = () => {
    if (!decodedData) return;
    
    // For images or video assuming it's a data URL
    if (type === 'image' || type === 'video') {
      const a = document.createElement('a');
      a.href = decodedData;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // For text/code
    const blob = new Blob([decodedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Attempt to give appropriate extension
    let ext = '.txt';
    if (type === 'code') {
       if (filename && filename !== 'download') ext = ''; // Already has ext
       else ext = '.js'; // Default fallback
    } else if (type === 'text' || type === 'markdown') {
       ext = '.md';
    }
    
    a.download = filename.includes('.') ? filename : filename + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 border border-destructive/20 rounded-xl mt-8">
        <AlertTriangle className="text-destructive mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Decoding Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!decodedData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-primary rounded-full animate-bounce"></div>
          <p className="mt-4 text-muted-foreground font-medium">Decoding Payload...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold capitalize">{type || 'Unknown'} Viewer</h1>
          <p className="text-sm text-muted-foreground">Decoded payload from QR Code</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-muted px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Copy size={16} /> Copy
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Download size={16} /> Download
          </button>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {type === 'code' ? (
          <div className="overflow-x-auto text-sm">
            <Highlight
              theme={themes.vsDark}
              code={decodedData}
              language="javascript"
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre style={style} className={`p-6 ${className}`}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span className="inline-block w-8 text-right opacity-50 select-none mr-4">{i + 1}</span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
        ) : type === 'text' || type === 'markdown' ? (
          <div className="p-6 prose dark:prose-invert max-w-none">
            <ReactMarkdown>{decodedData}</ReactMarkdown>
          </div>
        ) : type === 'image' ? (
          <div className="p-6 flex justify-center bg-muted/20">
            <img src={decodedData} alt="Decoded" className="max-w-full rounded-lg shadow-sm" />
          </div>
        ) : type === 'video' ? (
          <div className="p-6 flex justify-center bg-muted/20">
            <video src={decodedData} controls className="max-w-full rounded-lg shadow-sm" />
          </div>
        ) : (
          <div className="p-6">
            <p className="whitespace-pre-wrap font-mono text-sm">{decodedData}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewer;
