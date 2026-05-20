import { apiBaseUrl } from './lib/api'

const nextTasks = [
  'Confirmar endpoints de autenticacion con el backend',
  'Definir pantallas para pacientes, doctores y citas',
  'Conectar formularios cuando el API este lista',
]

function App() {
  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="panel intro-panel">
          <p className="eyebrow">Frontend_citas</p>
          <h1>Sistema de citas</h1>
          <p className="lead">
            Base inicial del frontend lista para conectarse al backend NestJS.
          </p>
        </div>

        <div className="panel status-panel">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <p className="eyebrow">API configurada</p>
          </div>
          <code>{apiBaseUrl}</code>
        </div>

        <div className="panel tasks-panel">
          <h2>Proximos pasos</h2>
          <ul>
            {nextTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

export default App
