import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useTrans } from '@/hooks/useTranslation';
import { PageProps } from '@/types';
import EventTooltip from '@/Components/EventTooltip';

interface User {
    id: number;
    name: string;
}

interface CalendarEvent {
    id: number;
    title: string;
    description: string | null;
    start: string;
    end: string;
    allDay: boolean;
    location: string | null;
    color: string;
    user: User;
    family: {
        id: number;
        name: string;
    } | null;
    recurrenceType: string;
    isRecurring: boolean;
    attendants: User[];
}

interface Props {
    events: CalendarEvent[];
    currentDate: string;
    familyMembers: User[];
}

export default function Index({ events, currentDate, familyMembers }: Props) {
    const t = useTrans();
    const { auth } = usePage<PageProps>().props;
    const currentUserId = auth.user.id;
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [currentDate2, setCurrentDate2] = useState(new Date(currentDate));
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
    const [showPersonalEvents, setShowPersonalEvents] = useState(true);
    const [showFamilyEvents, setShowFamilyEvents] = useState(true);
    const [tooltipEvent, setTooltipEvent] = useState<CalendarEvent | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_datetime: '',
        end_datetime: '',
        all_day: false,
        location: '',
        color: '#0d6efd',
        recurrence_type: 'none',
        recurrence_interval: 1,
        recurrence_end_date: '',
        reminder_minutes: 0,
        attendants: [] as number[],
        shared_to_family: false,
    });

    const canEditEvent = (event: CalendarEvent) => {
        return event.user.id === currentUserId;
    };

    const getEventTooltip = (event: CalendarEvent) => {
        const startTime = new Date(event.start).toLocaleString(navigator.language, { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const endTime = new Date(event.end).toLocaleString(navigator.language, { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let tooltip = `${event.title}\n`;
        tooltip += `${startTime} - ${endTime}\n`;
        if (event.description) tooltip += `\n${event.description}\n`;
        if (event.location) tooltip += `\n📍 ${event.location}\n`;
        tooltip += `\n👤 ${event.user.name}`;
        if (event.family) tooltip += `\n👨‍👩‍👧‍👦 ${event.family.name}`;
        if (event.isRecurring) tooltip += `\n🔄 Opakující se (${event.recurrenceType})`;
        
        return tooltip;
    };

    const showTooltip = (event: CalendarEvent, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipEvent(event);
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    };

    const hideTooltip = () => {
        setTooltipEvent(null);
        setTooltipPosition(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                hideTooltip();
            }
        };

        if (tooltipEvent) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [tooltipEvent]);

    const filteredEvents = events.filter(event => {
        if (event.family === null && !showPersonalEvents) return false;
        if (event.family !== null && !showFamilyEvents) return false;
        return true;
    });

    const getDaysInMonth = () => {
        const year = currentDate2.getFullYear();
        const month = currentDate2.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        const days: (Date | null)[] = [];
        for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate2);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const getEventsForDay = (day: Date) => {
        return filteredEvents.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
            const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
            return (eventStart >= dayStart && eventStart <= dayEnd) ||
                   (eventEnd >= dayStart && eventEnd <= dayEnd) ||
                   (eventStart <= dayStart && eventEnd >= dayEnd);
        });
    };

    const navigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate2);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate2(newDate);
    };

    const today = () => setCurrentDate2(new Date());

    const openNewEventModal = (date?: Date) => {
        const targetDate = date || new Date();
        const startDateTime = new Date(targetDate);
        startDateTime.setHours(9, 0, 0, 0);
        const endDateTime = new Date(targetDate);
        endDateTime.setHours(10, 0, 0, 0);
        setFormData({
            title: '',
            description: '',
            start_datetime: startDateTime.toISOString().slice(0, 16),
            end_datetime: endDateTime.toISOString().slice(0, 16),
            all_day: false,
            location: '',
            color: '#0d6efd',
            recurrence_type: 'none',
            recurrence_interval: 1,
            recurrence_end_date: '',
            reminder_minutes: 0,
            attendants: [],
            shared_to_family: false,
        });
        setEditingEvent(null);
        setShowEventModal(true);
    };

    const openEditEventModal = (event: CalendarEvent) => {
        setFormData({
            title: event.title,
            description: event.description || '',
            start_datetime: new Date(event.start).toISOString().slice(0, 16),
            end_datetime: new Date(event.end).toISOString().slice(0, 16),
            all_day: event.allDay,
            location: event.location || '',
            color: event.color,
            recurrence_type: event.recurrenceType,
            recurrence_interval: 1,
            recurrence_end_date: '',
            reminder_minutes: 0,
            attendants: event.attendants ? event.attendants.map(a => a.id) : [],
            shared_to_family: event.sharedToFamily ?? false,
        });
        setEditingEvent(event);
        setShowEventModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEvent) {
            router.patch(`/calendar/${editingEvent.id}`, formData, {
                onSuccess: () => setShowEventModal(false),
            });
        } else {
            router.post('/calendar', formData, {
                onSuccess: () => setShowEventModal(false),
            });
        }
    };

    const handleDelete = (eventId: number) => {
        if (confirm(t('delete_event_confirm'))) {
            router.delete(`/calendar/${eventId}`);
            setShowEventModal(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetDay: Date) => {
        e.preventDefault();
        if (!draggedEvent) return;
        const eventStart = new Date(draggedEvent.start);
        const eventEnd = new Date(draggedEvent.end);
        const duration = eventEnd.getTime() - eventStart.getTime();
        const newStart = new Date(targetDay);
        newStart.setHours(eventStart.getHours(), eventStart.getMinutes(), 0, 0);
        const newEnd = new Date(newStart.getTime() + duration);
        router.patch(`/calendar/${draggedEvent.id}/move`, {
            start_datetime: newStart.toISOString().slice(0, 16).replace('T', ' '),
            end_datetime: newEnd.toISOString().slice(0, 16).replace('T', ' '),
        });
        setDraggedEvent(null);
    };

    const getViewTitle = () => {
        if (view === 'month') {
            return currentDate2.toLocaleDateString(navigator.language, { month: 'long', year: 'numeric' });
        } else if (view === 'week') {
            const weekDays = getWeekDays();
            const firstDay = weekDays[0];
            const lastDay = weekDays[6];
            return `${firstDay.getDate()}. ${firstDay.toLocaleDateString(navigator.language, { month: 'short' })} - ${lastDay.getDate()}. ${lastDay.toLocaleDateString(navigator.language, { month: 'short', year: 'numeric' })}`;
        } else {
            return currentDate2.toLocaleDateString(navigator.language, { day: 'numeric', month: 'long', year: 'numeric' });
        }
    };

    const renderMonthView = () => {
        const weekDays = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        const days = getDaysInMonth();
        return (
            <div className="calendar-grid">
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#dee2e6' }}>
                    {weekDays.map(day => <div key={day} className="bg-light text-center py-2 fw-semibold text-muted" style={{ fontSize: '0.875rem' }}>{day}</div>)}
                </div>
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#dee2e6' }}>
                    {days.map((day, index) => {
                        const isToday = day && day.toDateString() === new Date().toDateString();
                        const dayEvents = day ? getEventsForDay(day) : [];
                        return (
                            <div key={index} className="bg-white position-relative" style={{ minHeight: '120px', cursor: day ? 'pointer' : 'default', opacity: day ? 1 : 0.3 }}
                                onClick={() => day && openNewEventModal(day)}
                                onDragOver={day ? handleDragOver : undefined}
                                onDrop={day ? (e) => handleDrop(e, day) : undefined}>
                                {day && (<>
                                    <div className="p-2"><span className={`badge ${isToday ? 'bg-primary' : 'bg-light text-dark'}`} style={{ fontSize: '0.75rem' }}>{day.getDate()}</span></div>
                                    <div className="px-2 pb-2">
                                        {dayEvents.slice(0, 3).map(event => {
                                            const isEditable = canEditEvent(event);
                                            return (
                                                <div 
                                                    key={event.id} 
                                                    className="mb-1 p-1 rounded text-white" 
                                                    style={{ 
                                                        backgroundColor: event.color, 
                                                        fontSize: '0.7rem', 
                                                        cursor: isEditable ? 'grab' : 'default',
                                                        opacity: isEditable ? 1 : 0.8
                                                    }}
                                                    onMouseEnter={(e) => showTooltip(event, e)}
                                                    onMouseLeave={hideTooltip}
                                                    draggable={isEditable} 
                                                    onDragStart={isEditable ? (e) => handleDragStart(e, event) : undefined} 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        if (isEditable) openEditEventModal(event); 
                                                    }}>
                                                    <div className="text-truncate">
                                                        {event.isRecurring && <i className="bi bi-arrow-repeat me-1" />}
                                                        {event.family
                                            ? <i className="bi bi-people me-1" />
                                            : <i className={`bi ${event.sharedToFamily ? 'bi-eye-fill' : 'bi-eye-slash-fill'} me-1`} style={{ opacity: 0.85 }} />}
                                                        {event.title}
                                                        {!isEditable && <i className="bi bi-lock-fill ms-1" style={{ fontSize: '0.6rem' }} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {dayEvents.length > 3 && <div className="text-muted" style={{ fontSize: '0.7rem' }}>+{dayEvents.length - 3} další</div>}
                                    </div>
                                </>)}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays();
        const hours = Array.from({ length: 24 }, (_, i) => i);
        return (
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                <div className="d-grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', gap: '1px', background: '#dee2e6' }}>
                    <div className="bg-light"></div>
                    {weekDays.map(day => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                            <div key={day.toString()} className={`bg-light text-center py-2 fw-semibold ${isToday ? 'text-primary' : ''}`} style={{ fontSize: '0.875rem' }}>
                                <div>{day.toLocaleDateString(navigator.language, { weekday: 'short' })}</div>
                                <div className={isToday ? 'badge bg-primary' : ''}>{day.getDate()}</div>
                            </div>
                        );
                    })}
                </div>
                {hours.map(hour => (
                    <div key={hour} className="d-grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', gap: '1px', background: '#dee2e6', minHeight: '60px' }}>
                        <div className="bg-light text-center text-muted" style={{ fontSize: '0.75rem', paddingTop: '4px' }}>{hour.toString().padStart(2, '0')}:00</div>
                        {weekDays.map(day => {
                            const dayEvents = getEventsForDay(day).filter(event => {
                                const eventHour = new Date(event.start).getHours();
                                return eventHour === hour;
                            });
                            return (
                                <div key={day.toString()} className="bg-white position-relative" 
                                    onClick={() => {
                                        const newDate = new Date(day);
                                        newDate.setHours(hour, 0, 0, 0);
                                        openNewEventModal(newDate);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => {
                                        const newDate = new Date(day);
                                        newDate.setHours(hour, 0, 0, 0);
                                        handleDrop(e, newDate);
                                    }}>
                                    {dayEvents.map(event => {
                                        const isEditable = canEditEvent(event);
                                        return (
                                            <div 
                                                key={event.id} 
                                                className="p-1 mb-1 rounded text-white" 
                                                style={{ 
                                                    backgroundColor: event.color, 
                                                    fontSize: '0.7rem', 
                                                    cursor: isEditable ? 'grab' : 'default',
                                                    opacity: isEditable ? 1 : 0.8
                                                }}
                                                onMouseEnter={(e) => showTooltip(event, e)}
                                                onMouseLeave={hideTooltip}
                                                draggable={isEditable}
                                                onDragStart={isEditable ? (e) => handleDragStart(e, event) : undefined}
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if (isEditable) openEditEventModal(event); 
                                                }}>
                                                <div className="fw-bold d-flex align-items-center gap-1">
                                                    {!event.family && <i className={`bi ${event.sharedToFamily ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`} style={{ fontSize: '0.65rem', opacity: 0.85 }} />}
                                                    {event.family && <i className="bi bi-people" style={{ fontSize: '0.65rem' }} />}
                                                    {event.title}
                                                    {event.isRecurring && <i className="bi bi-arrow-repeat" style={{ fontSize: '0.65rem' }} />}
                                                    {!isEditable && <i className="bi bi-lock-fill" style={{ fontSize: '0.6rem' }} />}
                                                </div>
                                                <div>{new Date(event.start).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    const renderDayView = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const dayEvents = getEventsForDay(currentDate2);
        return (
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                {hours.map(hour => {
                    const hourEvents = dayEvents.filter(event => {
                        const eventHour = new Date(event.start).getHours();
                        return eventHour === hour;
                    });
                    return (
                        <div key={hour} className="d-flex border-bottom" style={{ minHeight: '80px' }}>
                            <div className="text-muted text-center" style={{ width: '80px', fontSize: '0.875rem', paddingTop: '8px' }}>
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="flex-grow-1 position-relative bg-light" 
                                onClick={() => {
                                    const newDate = new Date(currentDate2);
                                    newDate.setHours(hour, 0, 0, 0);
                                    openNewEventModal(newDate);
                                }}
                                style={{ cursor: 'pointer' }}
                                onDragOver={handleDragOver}
                                onDrop={(e) => {
                                    const newDate = new Date(currentDate2);
                                    newDate.setHours(hour, 0, 0, 0);
                                    handleDrop(e, newDate);
                                }}>
                                {hourEvents.map(event => {
                                    const isEditable = canEditEvent(event);
                                    return (
                                        <div 
                                            key={event.id} 
                                            className="p-2 m-2 rounded text-white" 
                                            style={{ 
                                                backgroundColor: event.color, 
                                                cursor: isEditable ? 'grab' : 'default',
                                                opacity: isEditable ? 1 : 0.8
                                            }}
                                            onMouseEnter={(e) => showTooltip(event, e)}
                                            onMouseLeave={hideTooltip}
                                            draggable={isEditable}
                                            onDragStart={isEditable ? (e) => handleDragStart(e, event) : undefined}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                if (isEditable) openEditEventModal(event); 
                                            }}>
                                            <div className="fw-bold d-flex align-items-center gap-2">
                                                {event.family
                                                    ? <i className="bi bi-people" />
                                                    : <i className={`bi ${event.sharedToFamily ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`} style={{ opacity: 0.9 }} />}
                                                {event.title}
                                                {event.isRecurring && <i className="bi bi-arrow-repeat" />}
                                                {!isEditable && <i className="bi bi-lock-fill" style={{ fontSize: '0.8rem' }} />}
                                            </div>
                                            <div className="small">
                                                {new Date(event.start).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {event.location && <div className="small"><i className="bi bi-geo-alt me-1" />{event.location}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title={t('calendar')} />
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3 mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-calendar3 text-primary" />
                        {t('calendar')}
                    </h1>
                    <button className="btn btn-primary" onClick={() => openNewEventModal()}>
                        <i className="bi bi-plus-lg me-1" />
                        {t('new_event')}
                    </button>
                </div>
                <div className="card shadow-sm mb-3">
                    <div className="card-body py-3">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('prev')}>
                                    <i className="bi bi-chevron-left" />
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={today}>
                                    {t('today')}
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('next')}>
                                    <i className="bi bi-chevron-right" />
                                </button>
                                <h5 className="mb-0 ms-3 text-capitalize">{getViewTitle()}</h5>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex gap-2">
                                    <div className="form-check form-check-inline">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="showPersonal" 
                                            checked={showPersonalEvents}
                                            onChange={(e) => setShowPersonalEvents(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="showPersonal">
                                            <i className="bi bi-person me-1" />
                                            Personální
                                        </label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="showFamily" 
                                            checked={showFamilyEvents}
                                            onChange={(e) => setShowFamilyEvents(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="showFamily">
                                            <i className="bi bi-people me-1" />
                                            Rodinné
                                        </label>
                                    </div>
                                </div>
                                <div className="btn-group btn-group-sm">
                                    <button className={`btn ${view === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setView('month')}>{t('month')}</button>
                                    <button className={`btn ${view === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setView('week')}>{t('week')}</button>
                                    <button className={`btn ${view === 'day' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setView('day')}>{t('day')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        {view === 'month' && renderMonthView()}
                        {view === 'week' && renderWeekView()}
                        {view === 'day' && renderDayView()}
                    </div>
                </div>
            </div>
            {showEventModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowEventModal(false)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingEvent ? t('edit_event') : t('new_event')}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEventModal(false)} />
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">{t('event_title')}</label>
                                        <input type="text" className="form-control" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('description')}</label>
                                        <textarea className="form-control" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">{t('start_date')}</label>
                                            <input type="datetime-local" className="form-control" value={formData.start_datetime} onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">{t('end_date')}</label>
                                            <input type="datetime-local" className="form-control" value={formData.end_datetime} onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input type="checkbox" className="form-check-input" id="allDay" checked={formData.all_day} onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })} />
                                        <label className="form-check-label" htmlFor="allDay">{t('all_day')}</label>
                                    </div>
                                    {!editingEvent?.family && (
                                        <div className="mb-3 p-2 rounded border" style={{ backgroundColor: formData.shared_to_family ? 'rgba(25,135,84,0.1)' : 'rgba(108,117,125,0.08)' }}>
                                            <div className="form-check mb-0">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="sharedToFamily"
                                                    checked={formData.shared_to_family}
                                                    onChange={(e) => setFormData({ ...formData, shared_to_family: e.target.checked })}
                                                />
                                                <label className="form-check-label d-flex align-items-center gap-2" htmlFor="sharedToFamily">
                                                    <i className={`bi ${formData.shared_to_family ? 'bi-eye-fill text-success' : 'bi-eye-slash-fill text-muted'}`} />
                                                    <span>
                                                        {formData.shared_to_family
                                                            ? 'Viditelné v rodinných kalendářích'
                                                            : 'Pouze pro mě (skryté pro rodinu)'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">{t('location')}</label>
                                        <input type="text" className="form-control" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('recurrence')}</label>
                                        <select className="form-select" value={formData.recurrence_type} onChange={(e) => setFormData({ ...formData, recurrence_type: e.target.value })} disabled={!!editingEvent}>
                                            <option value="none">{t('no_recurrence')}</option>
                                            <option value="daily">{t('daily')}</option>
                                            <option value="weekly">{t('weekly')}</option>
                                            <option value="monthly">{t('monthly')}</option>
                                            <option value="yearly">{t('yearly')}</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('color')}</label>
                                        <div className="d-flex gap-2">
                                            {['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14'].map(color => (
                                                <div key={color} className="rounded-circle" style={{ width: 32, height: 32, backgroundColor: color, cursor: 'pointer', border: formData.color === color ? '3px solid #000' : '2px solid #dee2e6' }}
                                                    onClick={() => setFormData({ ...formData, color })} />
                                            ))}
                                        </div>
                                    </div>
                                    {familyMembers.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label">
                                                <i className="bi bi-person-check-fill me-2" />
                                                Účastníci z rodiny
                                            </label>
                                            <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {familyMembers.map(member => (
                                                    <div key={member.id} className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`attendant-${member.id}`}
                                                            checked={formData.attendants.includes(member.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormData({ ...formData, attendants: [...formData.attendants, member.id] });
                                                                } else {
                                                                    setFormData({ ...formData, attendants: formData.attendants.filter(id => id !== member.id) });
                                                                }
                                                            }}
                                                        />
                                                        <label className="form-check-label" htmlFor={`attendant-${member.id}`}>
                                                            {member.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            {formData.attendants.length > 0 && (
                                                <small className="text-muted">
                                                    Vybráno: {formData.attendants.length} {formData.attendants.length === 1 ? 'účastník' : formData.attendants.length < 5 ? 'účastníci' : 'účastníků'}
                                                </small>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    {editingEvent && (<button type="button" className="btn btn-danger me-auto" onClick={() => handleDelete(editingEvent.id)}><i className="bi bi-trash me-1" />{t('delete')}</button>)}
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>{t('cancel')}</button>
                                    <button type="submit" className="btn btn-primary">{editingEvent ? t('save') : t('create')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {tooltipEvent && tooltipPosition && (
                <div 
                    ref={tooltipRef}
                    style={{
                        position: 'fixed',
                        left: tooltipPosition.x,
                        top: tooltipPosition.y - 10,
                        transform: 'translate(-50%, -100%)',
                        zIndex: 10000,
                        pointerEvents: 'auto',
                    }}
                >
                    <EventTooltip
                        title={tooltipEvent.title}
                        description={tooltipEvent.description}
                        start={tooltipEvent.start}
                        end={tooltipEvent.end}
                        allDay={tooltipEvent.allDay}
                        location={tooltipEvent.location}
                        user={tooltipEvent.user}
                        family={tooltipEvent.family}
                        isRecurring={tooltipEvent.isRecurring}
                        recurrenceType={tooltipEvent.recurrenceType}
                        attendants={tooltipEvent.attendants}
                        canEdit={canEditEvent(tooltipEvent)}
                    />
                </div>
            )}
        </AppLayout>
    );
}
