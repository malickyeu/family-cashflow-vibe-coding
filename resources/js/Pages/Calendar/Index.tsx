import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useTrans } from '@/hooks/useTranslation';
interface CalendarEvent {
    id: number;
    title: string;
    description: string | null;
    start: string;
    end: string;
    allDay: boolean;
    location: string | null;
    color: string;
    user: {
        id: number;
        name: string;
    };
    family: {
        id: number;
        name: string;
    } | null;
    recurrenceType: string;
    isRecurring: boolean;
}
interface Props {
    events: CalendarEvent[];
    currentDate: string;
}
export default function Index({ events, currentDate }: Props) {
    const t = useTrans();
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [currentMonth, setCurrentMonth] = useState(new Date(currentDate));
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
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
    });
    useEffect(() => {
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        router.reload({
            data: {
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0],
            },
            only: ['events'],
        });
    }, [currentMonth]);
    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
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
    const getEventsForDay = (day: Date) => {
        return events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
            const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
            return (eventStart >= dayStart && eventStart <= dayEnd) ||
                   (eventEnd >= dayStart && eventEnd <= dayEnd) ||
                   (eventStart <= dayStart && eventEnd >= dayEnd);
        });
    };
    const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    const today = () => setCurrentMonth(new Date());
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
        });
        setEditingEvent(event);
        setShowEventModal(true);
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEvent) {
            router.patch(\`/calendar/\${editingEvent.id}\`, formData, {
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
            router.delete(\`/calendar/\${eventId}\`);
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
    const monthName = currentMonth.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
    const weekDays = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
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
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={previousMonth}>
                                    <i className="bi bi-chevron-left" />
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={today}>
                                    {t('today')}
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={nextMonth}>
                                    <i className="bi bi-chevron-right" />
                                </button>
                                <h5 className="mb-0 ms-3 text-capitalize">{monthName}</h5>
                            </div>
                            <div className="btn-group btn-group-sm">
                                <button className={\`btn \${view === 'month' ? 'btn-primary' : 'btn-outline-secondary'}\`} onClick={() => setView('month')}>{t('month')}</button>
                                <button className={\`btn \${view === 'week' ? 'btn-primary' : 'btn-outline-secondary'}\`} onClick={() => setView('week')}>{t('week')}</button>
                                <button className={\`btn \${view === 'day' ? 'btn-primary' : 'btn-outline-secondary'}\`} onClick={() => setView('day')}>{t('day')}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="calendar-grid">
                            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#dee2e6' }}>
                                {weekDays.map(day => <div key={day} className="bg-light text-center py-2 fw-semibold text-muted" style={{ fontSize: '0.875rem' }}>{day}</div>)}
                            </div>
                            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#dee2e6' }}>
                                {getDaysInMonth().map((day, index) => {
                                    const isToday = day && day.toDateString() === new Date().toDateString();
                                    const dayEvents = day ? getEventsForDay(day) : [];
                                    return (
                                        <div key={index} className="bg-white position-relative" style={{ minHeight: '120px', cursor: day ? 'pointer' : 'default', opacity: day ? 1 : 0.3 }}
                                            onClick={() => day && openNewEventModal(day)}
                                            onDragOver={day ? handleDragOver : undefined}
                                            onDrop={day ? (e) => handleDrop(e, day) : undefined}>
                                            {day && (<>
                                                <div className="p-2"><span className={\`badge \${isToday ? 'bg-primary' : 'bg-light text-dark'}\`} style={{ fontSize: '0.75rem' }}>{day.getDate()}</span></div>
                                                <div className="px-2 pb-2">
                                                    {dayEvents.slice(0, 3).map(event => (
                                                        <div key={event.id} className="mb-1 p-1 rounded text-white" style={{ backgroundColor: event.color, fontSize: '0.7rem', cursor: 'grab' }}
                                                            draggable onDragStart={(e) => handleDragStart(e, event)} onClick={(e) => { e.stopPropagation(); openEditEventModal(event); }}>
                                                            <div className="text-truncate">{event.isRecurring && <i className="bi bi-arrow-repeat me-1" />}{event.title}</div>
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 3 && <div className="text-muted" style={{ fontSize: '0.7rem' }}>+{dayEvents.length - 3} další</div>}
                                                </div>
                                            </>)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
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
        </AppLayout>
    );
}
