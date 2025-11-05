
import React, { useState } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { X, Copy, Share2 } from '../icons/Icons';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string | null;
  groupName: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, inviteCode, groupName }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !inviteCode) return null;

  const inviteLink = `${window.location.origin}${window.location.pathname}#/join/${inviteCode}`;
  const shareText = `Join my movie night group "${groupName}" on DECIDE! 🎬\n\nWe're done arguing about what to watch 😂\n\nJoin with code: ${inviteCode}\nor visit: ${inviteLink}`;

  const handleCopy = async (text: string, type: 'code' | 'link') => {
    const success = await copyToClipboard(text);
    if (success) {
        if (type === 'code') setCopiedCode(true);
        if (type === 'link') setCopiedLink(true);
        setTimeout(() => {
            setCopiedCode(false);
            setCopiedLink(false);
        }, 2000);
    }
  };
  
  const handleNativeShare = () => {
    if (navigator.share) {
        navigator.share({
            title: `Join "${groupName}" on DECIDE`,
            text: shareText,
            url: inviteLink,
        }).catch(err => console.error("Share failed:", err));
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-friends-title"
    >
      <div 
        className="bg-dark-elevated rounded-2xl shadow-lg w-full max-w-md p-8 text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
            <div className="w-6"></div> {/* Spacer */}
            <h2 id="invite-friends-title" className="text-2xl font-bold text-white">Invite Friends</h2>
            <button onClick={onClose} aria-label="Close modal">
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
        </div>

        <div>
            <p className="text-gray-400">Share this code with your friends:</p>
            <div className="mt-2 flex items-center justify-center bg-dark rounded-lg p-4">
                <span className="text-3xl font-mono tracking-widest text-gold">{inviteCode}</span>
                <button onClick={() => handleCopy(inviteCode, 'code')} className="ml-4 p-2 text-gray-400 hover:text-white">
                    {copiedCode ? <span className="text-sm text-cinema-green">Copied! ✓</span> : <Copy className="w-6 h-6" />}
                </button>
            </div>
        </div>

        <div>
            <p className="text-gray-400">Or share the link:</p>
             <div className="mt-2 flex items-center justify-center bg-dark rounded-lg p-2 text-sm">
                <span className="text-gray-300 truncate">{inviteLink}</span>
                <button onClick={() => handleCopy(inviteLink, 'link')} className="ml-2 p-2 text-gray-400 hover:text-white flex-shrink-0">
                    {copiedLink ? <span className="text-sm text-cinema-green">Copied! ✓</span> : <Copy className="w-5 h-5" />}
                </button>
            </div>
        </div>
        
        {navigator.share && (
            <button onClick={handleNativeShare} className="w-full h-12 flex items-center justify-center bg-gold text-dark font-bold rounded-lg hover:bg-gold-light transition-all">
                <Share2 className="w-5 h-5 mr-2" /> Share via...
            </button>
        )}

        <button onClick={onClose} className="w-full h-12 rounded-lg text-white hover:bg-dark-hover">Done</button>
      </div>
    </div>
  );
};

export default InviteModal;
