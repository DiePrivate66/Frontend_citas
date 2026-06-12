import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ApiError, authApiFetch } from '../lib/api'

type ServiceOption = {
  id: number
  businessId: number
  name: string
  durationMinutes: number
  price: string
  isActive: boolean
}

type StaffOption = {
  id: number
  businessId: number
  name: string
  roleTitle: string
  isActive: boolean
}

type ClientResponse = {
  id: number
  businessId: number
  name: string
  email?: string
  phone?: string
}

type AppointmentResponse = {
  id: number
  startsAt: string
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

function AppointmentBookingPage({
  token,
  onLogout,
}: {
  token: string
  onLogout: () => void
}) {
  const [form, setForm] = useState<BookingForm>(initialForm)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [staff, setStaff] = useState<StaffOption[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>(
    {},
  )
  const [loadError, setLoadError] = useState('')
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [summary, setSummary] = useState<BookingSummary | null>(null)

  const selectedService = useMemo(
    () => services.find((service) => service.id === Number(form.serviceId)),
    [form.serviceId, services],
  )

  const selectedStaff = useMemo(
    () => staff.find((staffMember) => staffMember.id === Number(form.staffId)),
    [form.staffId, staff],
  )

  useEffect(() => {
    let isMounted = true

    async function loadOptions() {
      try {
        setIsLoadingOptions(true)
        setLoadError('')

        const [serviceOptions, staffOptions] = await Promise.all([
          authApiFetch<ServiceOption[]>('/services', token),
          authApiFetch<StaffOption[]>('/staff', token),
        ])

        if (!isMounted) {
          return
        }

        setServices(
          serviceOptions.filter(
            (service) => service.businessId === businessId && service.isActive,
          ),
        )
        setStaff(
          staffOptions.filter(
            (staffMember) =>
              staffMember.businessId === businessId && staffMember.isActive,
          ),
        )
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (error instanceof ApiError && error.status === 401) {
          onLogout()
          return
        }

        setLoadError('No se pudieron cargar servicios y profesionales.')
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false)
        }
      }
    }

    void loadOptions()

    return () => {
      isMounted = false
    }
  }, [onLogout, token])

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
      const client = await createOrFindClient(token, {
        businessId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        notes: buildClientNotes(form.cedula, form.notes),
      })
      const appointment = await authApiFetch<AppointmentResponse>(
        '/appointments',
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            businessId,
            serviceId: Number(form.serviceId),
            clientId: client.id,
            staffId: form.staffId ? Number(form.staffId) : undefined,
            startsAt,
            notes: form.notes.trim() || undefined,
          }),
        },
      )

      setSummary({
        clientName: form.name.trim(),
        serviceName: selectedService?.name ?? 'Servicio seleccionado',
        staffName: selectedStaff?.name ?? 'Profesional por asignar',
        startsAt: appointment.startsAt,
      })
      setForm(initialForm)
    } catch (error) {
      setSubmitError(getSubmitError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="booking-page">
      <section className="booking-hero">
        <div className="top-bar">
          <p className="eyebrow">Agenda de salud</p>
          <button type="button" className="ghost-button" onClick={onLogout}>
            Cerrar sesion
          </button>
        </div>
        <h1>Reserva tu cita de salud</h1>
        <p className="lead">
          Registra los datos del paciente, elige el servicio y confirma la cita
          directamente contra el backend en produccion.
        </p>
      </section>

      {loadError ? <p className="form-error">{loadError}</p> : null}

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
                disabled={isLoadingOptions}
                onChange={(event) =>
                  updateField('serviceId', event.target.value)
                }
              >
                <option value="">
                  {isLoadingOptions
                    ? 'Cargando servicios...'
                    : 'Selecciona un servicio'}
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.durationMinutes} min -{' '}
                    {formatPrice(service.price)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="staffId" label="Profesional de salud">
              <select
                id="staffId"
                name="staffId"
                value={form.staffId}
                disabled={isLoadingOptions}
                onChange={(event) => updateField('staffId', event.target.value)}
              >
                <option value="">Cualquier profesional disponible</option>
                {staff.map((staffMember) => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {staffMember.name} - {staffMember.roleTitle}
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
              <strong>Cita registrada correctamente.</strong>
              <span>
                {summary.clientName} - {summary.serviceName} -{' '}
                {summary.staffName} - {formatAppointmentDate(summary.startsAt)}
              </span>
            </div>
          ) : null}

          <button type="submit" disabled={isSubmitting || isLoadingOptions}>
            {isSubmitting ? 'Registrando cita...' : 'Agendar cita'}
          </button>
        </section>
      </form>
    </main>
  )
}

async function createOrFindClient(
  token: string,
  payload: {
    businessId: number
    name: string
    email: string
    phone: string
    notes?: string
  },
) {
  try {
    return await authApiFetch<ClientResponse>('/clients', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 409) {
      throw error
    }

    const clients = await authApiFetch<ClientResponse[]>('/clients', token)
    const existingClient = clients.find(
      (client) =>
        client.businessId === payload.businessId &&
        (client.email === payload.email || client.phone === payload.phone),
    )

    if (!existingClient) {
      throw error
    }

    return existingClient
  }
}

function buildClientNotes(cedula: string, notes: string) {
  return [`Cedula: ${cedula.trim()}`, notes.trim()].filter(Boolean).join('\n')
}

function getSubmitError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'No se pudo registrar la cita. Intenta otra vez.'
}

function formatPrice(value: string) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return value
  }

  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(numericValue)
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
  children: ReactNode
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

export default AppointmentBookingPage
