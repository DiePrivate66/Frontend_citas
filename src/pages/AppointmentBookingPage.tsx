import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type ServiceOption = {
  id: number
  name: string
  durationMinutes: number
  price: string
}

type StaffOption = {
  id: number
  name: string
  roleTitle: string
}

type BookingForm = {
  name: string
  cedula: string
  phone: string
  email: string
  serviceId: string
  staffId: string
  date: string
  time: string
  notes: string
}

type BookingSummary = {
  clientName: string
  serviceName: string
  staffName: string
  startsAt: string
}

const businessId = 1

const mockServices: ServiceOption[] = [
  {
    id: 1,
    name: 'Medicina general',
    durationMinutes: 30,
    price: '$15.00',
  },
  {
    id: 2,
    name: 'Psicologia clinica',
    durationMinutes: 45,
    price: '$20.00',
  },
  {
    id: 3,
    name: 'Odontologia general',
    durationMinutes: 45,
    price: '$25.00',
  },
  {
    id: 4,
    name: 'Psiquiatria',
    durationMinutes: 60,
    price: '$40.00',
  },
  {
    id: 5,
    name: 'Fisioterapia',
    durationMinutes: 50,
    price: '$30.00',
  },
]

const mockStaff: StaffOption[] = [
  {
    id: 1,
    name: 'Dra. Camila Torres',
    roleTitle: 'Medicina general',
  },
  {
    id: 2,
    name: 'Dr. Andres Molina',
    roleTitle: 'Psiquiatria',
  },
  {
    id: 3,
    name: 'Psic. Valeria Rios',
    roleTitle: 'Psicologia clinica',
  },
  {
    id: 4,
    name: 'Od. Mateo Cardenas',
    roleTitle: 'Odontologia general',
  },
  {
    id: 5,
    name: 'Ft. Daniel Vera',
    roleTitle: 'Fisioterapia',
  },
]

const initialForm: BookingForm = {
  name: '',
  cedula: '',
  phone: '',
  email: '',
  serviceId: '',
  staffId: '',
  date: '',
  time: '',
  notes: '',
}

function AppointmentBookingPage() {
  const [form, setForm] = useState<BookingForm>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>(
    {},
  )
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [summary, setSummary] = useState<BookingSummary | null>(null)

  const selectedService = useMemo(
    () => mockServices.find((service) => service.id === Number(form.serviceId)),
    [form.serviceId],
  )

  const selectedStaff = useMemo(
    () => mockStaff.find((staff) => staff.id === Number(form.staffId)),
    [form.staffId],
  )

  function updateField(field: keyof BookingForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
    setSubmitError('')
  }

  function validateForm() {
    const nextErrors: Partial<Record<keyof BookingForm, string>> = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Ingresa el nombre completo.'
    }

    if (!form.cedula.trim()) {
      nextErrors.cedula = 'Ingresa la cedula.'
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Ingresa el telefono.'
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Ingresa el email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Ingresa un email valido.'
    }

    if (!form.serviceId) {
      nextErrors.serviceId = 'Selecciona un servicio.'
    }

    if (!form.date) {
      nextErrors.date = 'Selecciona una fecha.'
    }

    if (!form.time) {
      nextErrors.time = 'Selecciona una hora.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')
    setSummary(null)

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const startsAt = new Date(`${form.date}T${form.time}:00`).toISOString()
      const futurePayload = {
        businessId,
        serviceId: Number(form.serviceId),
        staffId: form.staffId ? Number(form.staffId) : undefined,
        startsAt,
        client: {
          name: form.name.trim(),
          cedula: form.cedula.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        },
        notes: form.notes.trim() || undefined,
      }

      await simulateBookingRequest(futurePayload)

      setSummary({
        clientName: form.name.trim(),
        serviceName: selectedService?.name ?? 'Servicio seleccionado',
        staffName: selectedStaff?.name ?? 'Profesional por asignar',
        startsAt,
      })
      setForm(initialForm)
    } catch {
      setSubmitError('No se pudo registrar la cita. Intenta otra vez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="booking-page">
      <section className="booking-hero">
        <p className="eyebrow">Agenda de salud</p>
        <h1>Reserva tu cita de salud sin crear cuenta</h1>
        <p className="lead">
          El paciente completa sus datos personales y elige atencion medica,
          psicologica, odontologica, psiquiatrica o de fisioterapia. La reserva
          se conectara al backend cuando exista el endpoint publico.
        </p>
      </section>

      <form className="booking-form" onSubmit={handleSubmit} noValidate>
        <section className="booking-section" aria-labelledby="patient-title">
          <div className="section-heading">
            <p className="eyebrow">Paso 1</p>
            <h2 id="patient-title">Datos personales</h2>
          </div>

          <div className="form-grid">
            <FormField
              id="name"
              label="Nombre completo"
              error={errors.name}
            >
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Ej. Juan Perez"
              />
            </FormField>

            <FormField id="cedula" label="Cedula" error={errors.cedula}>
              <input
                id="cedula"
                name="cedula"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={form.cedula}
                onChange={(event) => updateField('cedula', event.target.value)}
                placeholder="Ej. 0102030405"
              />
            </FormField>

            <FormField id="phone" label="Telefono" error={errors.phone}>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="Ej. 0999999999"
              />
            </FormField>

            <FormField id="email" label="Email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </FormField>
          </div>
        </section>

        <section className="booking-section" aria-labelledby="appointment-title">
          <div className="section-heading">
            <p className="eyebrow">Paso 2</p>
            <h2 id="appointment-title">Datos de la cita</h2>
          </div>

          <div className="form-grid">
            <FormField
              id="serviceId"
              label="Servicio"
              error={errors.serviceId}
            >
              <select
                id="serviceId"
                name="serviceId"
                value={form.serviceId}
                onChange={(event) =>
                  updateField('serviceId', event.target.value)
                }
              >
                <option value="">Selecciona un servicio</option>
                {mockServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.durationMinutes} min -{' '}
                    {service.price}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="staffId" label="Profesional de salud">
              <select
                id="staffId"
                name="staffId"
                value={form.staffId}
                onChange={(event) => updateField('staffId', event.target.value)}
              >
                <option value="">Cualquier profesional disponible</option>
                {mockStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.roleTitle}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="date" label="Fecha" error={errors.date}>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
              />
            </FormField>

            <FormField id="time" label="Hora" error={errors.time}>
              <input
                id="time"
                name="time"
                type="time"
                value={form.time}
                onChange={(event) => updateField('time', event.target.value)}
              />
            </FormField>

            <FormField id="notes" label="Notas opcionales" className="wide">
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="Motivo de consulta, sintomas o informacion adicional"
                rows={4}
              />
            </FormField>
          </div>
        </section>

        <section className="booking-actions" aria-live="polite">
          {submitError ? <p className="form-error">{submitError}</p> : null}

          {summary ? (
            <div className="success-message">
              <strong>Cita registrada en modo demo.</strong>
              <span>
                {summary.clientName} - {summary.serviceName} -{' '}
                {summary.staffName} - {formatAppointmentDate(summary.startsAt)}
              </span>
            </div>
          ) : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando cita...' : 'Agendar cita'}
          </button>
        </section>
      </form>
    </main>
  )
}

function FormField({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`form-field ${className ?? ''}`.trim()}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}

function formatAppointmentDate(value: string) {
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function simulateBookingRequest(payload: unknown) {
  console.info('Future POST /public/appointments payload', payload)
  await new Promise((resolve) => window.setTimeout(resolve, 700))
}

export default AppointmentBookingPage
