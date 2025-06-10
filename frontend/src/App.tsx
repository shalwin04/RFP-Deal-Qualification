import { useState } from 'react';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
  file?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Welcome! How can I assist you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const sendMessage = () => {
    if (inputValue.trim() === '' && !file) return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      file: file?.name,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white">
      <div className="container mx-auto h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md rounded-lg p-4 ${
                message.isUser ? 'bg-blue-500' : 'bg-gray-700'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.file && (
                    <div className="flex-shrink-0">
                      <img
                        src={message.file}
                        alt="Uploaded file"
                        className="w-12 h-12 object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-white/900 mb-1">
                      {message.timestamp}
                    </p>
                    <p className="text-white">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 p-4 flex space-x-2">
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Upload File
          </button>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
