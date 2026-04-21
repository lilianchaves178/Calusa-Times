import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle, Megaphone } from 'lucide-react';
import api from '../lib/api';

const PopupAnnouncement = () => {
  const [popups, setPopups] = useState([]);
  const [dismissedPopups, setDismissedPopups] = useState([]);

  useEffect(() => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedPopups') || '[]');
    setDismissedPopups(dismissed);

    api
      .get('/popups')
      .then((res) => {
        const active = res.data.filter((p) => !dismissed.includes(p.id));
        setPopups(active);
      })
      .catch(() => setPopups([]));
  }, []);

  const dismissPopup = (popupId, showOnce) => {
    setPopups((arr) => arr.filter((p) => p.id !== popupId));

    if (showOnce) {
      const updated = [...dismissedPopups, popupId];
      setDismissedPopups(updated);
      localStorage.setItem('dismissedPopups', JSON.stringify(updated));
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="text-orange-500" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'announcement':
        return <Megaphone className="text-blue-500" size={24} />;
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'warning':
        return 'border-orange-500 bg-orange-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'announcement':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  if (popups.length === 0) return null;

  const popup = popups[0];

  return (
    <div
      key={popup.id}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in"
      data-testid={`popup-${popup.id}`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full border-4 ${getColors(
          popup.type,
        )} animate-in zoom-in`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getIcon(popup.type)}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{popup.title}</h3>
              <p className="text-gray-700 leading-relaxed">{popup.message}</p>
            </div>
            <button
              onClick={() => dismissPopup(popup.id, popup.show_once)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              data-testid="popup-close-btn"
            >
              <X size={24} />
            </button>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => dismissPopup(popup.id, popup.show_once)}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              data-testid="popup-dismiss-btn"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupAnnouncement;
