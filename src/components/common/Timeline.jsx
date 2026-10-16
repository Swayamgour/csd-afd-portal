import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

export function Timeline({ items = [], className = '' }) {
  return (
    <div className={`enterprise-timeline ${className}`}>
      {items.map((item, index) => {
        const isCompleted = item.status === 'completed';
        const isCurrent = item.status === 'current';
        const isPending = item.status === 'pending';

        return (
          <div
            key={index}
            className={`timeline-item ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''} ${isPending ? 'is-pending' : ''}`}
          >
            <div className="timeline-marker">
              {isCompleted ? (
                <span className="timeline-dot completed">
                  <Check size={12} aria-hidden="true" />
                </span>
              ) : isCurrent ? (
                <span className="timeline-dot current">
                  <Clock size={12} aria-hidden="true" />
                </span>
              ) : (
                <span className="timeline-dot pending" />
              )}
              {index < items.length - 1 && <span className="timeline-line" />}
            </div>

            <div className="timeline-content">
              <div className="timeline-header between">
                <h4 className="timeline-title">{item.step || item.title}</h4>
                {(item.date || item.time) && <span className="timeline-date small muted">{item.date || item.time}</span>}
              </div>
              {item.by && <p className="timeline-by small font-medium">By: {item.by}</p>}
              {(item.note || item.desc) && <p className="timeline-note small muted">{item.note || item.desc}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
