import React from 'react';

interface User {
    id: number;
    name: string;
}

interface Family {
    id: number;
    name: string;
}

interface EventTooltipProps {
    title: string;
    description: string | null;
    start: string;
    end: string;
    allDay: boolean;
    location: string | null;
    user: User;
    family: Family | null;
    isRecurring: boolean;
    recurrenceType: string;
    attendants: User[];
    canEdit: boolean;
    sharedToFamily: boolean;
}

export default function EventTooltip({
    title,
    description,
    start,
    end,
    allDay,
    location,
    user,
    family,
    isRecurring,
    recurrenceType,
    attendants,
    canEdit,
    sharedToFamily,
}: EventTooltipProps) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(navigator.language, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(navigator.language, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="event-tooltip" style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '250px',
            maxWidth: '350px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '0.875rem',
            zIndex: 9999,
        }}>
            <div className="d-flex align-items-start justify-content-between mb-2">
                <h6 className="fw-bold mb-0 flex-grow-1" style={{ fontSize: '1rem' }}>{title}</h6>
                {!canEdit && (
                    <i className="bi bi-lock-fill text-muted ms-2" title="Nelze editovat" />
                )}
            </div>

            <div className="border-bottom mb-2 pb-2">
                <div className="d-flex align-items-center text-muted mb-1">
                    <i className="bi bi-calendar3 me-2" style={{ width: '16px' }} />
                    <span>{formatDate(startDate)}</span>
                </div>
                <div className="d-flex align-items-center text-muted">
                    <i className="bi bi-clock me-2" style={{ width: '16px' }} />
                    <span>
                        {allDay ? 'Celý den' : `${formatTime(startDate)} - ${formatTime(endDate)}`}
                    </span>
                </div>
            </div>

            {description && (
                <div className="mb-2 pb-2 border-bottom">
                    <div className="text-muted small">{description}</div>
                </div>
            )}

            {location && (
                <div className="d-flex align-items-start mb-2">
                    <i className="bi bi-geo-alt me-2 text-danger" style={{ width: '16px', marginTop: '2px' }} />
                    <span className="text-muted small">{location}</span>
                </div>
            )}

            <div className="border-top pt-2 mt-2">
                <div className="d-flex align-items-center mb-1">
                    <i className="bi bi-person-fill me-2 text-primary" style={{ width: '16px' }} />
                    <span className="small"><strong>Organizátor:</strong> {user.name}</span>
                </div>

                {family && (
                    <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-people-fill me-2 text-success" style={{ width: '16px' }} />
                        <span className="small"><strong>Rodina:</strong> {family.name}</span>
                    </div>
                )}

                {attendants && attendants.length > 0 && (
                    <div className="d-flex align-items-start">
                        <i className="bi bi-person-check-fill me-2 text-info" style={{ width: '16px', marginTop: '2px' }} />
                        <div className="small flex-grow-1">
                            <strong>Účastníci:</strong>
                            <div className="mt-1">
                                {attendants.map((attendant, index) => (
                                    <span key={attendant.id} className="badge bg-info me-1 mb-1">
                                        {attendant.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {isRecurring && (
                    <div className="d-flex align-items-center mt-2 pt-2 border-top">
                        <i className="bi bi-arrow-repeat me-2 text-warning" style={{ width: '16px' }} />
                        <span className="small text-muted">
                            Opakující se ({recurrenceType === 'daily' ? 'denně' : 
                                          recurrenceType === 'weekly' ? 'týdně' : 
                                          recurrenceType === 'monthly' ? 'měsíčně' : 
                                          recurrenceType === 'yearly' ? 'ročně' : recurrenceType})
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
