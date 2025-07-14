'use client'

import { useEffect, useRef } from 'react'

interface GraficoActividadProps {
  labels: string[]
  pazYSalvos: number[]
  consultas: number[]
}

export default function GraficoActividad({
  labels,
  pazYSalvos,
  consultas
}: GraficoActividadProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    // Importamos Chart.js dinámicamente para evitar problemas con SSR
    const loadChart = async () => {
      // Esperamos a que se cargue la biblioteca
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)

      // Si el componente ya no está montado o no hay canvas, no hacer nada
      if (!chartRef.current) return
      
      // Verificar si ya existe un gráfico asociado al canvas y destruirlo
      const chartInstance = Chart.getChart(chartRef.current)
      if (chartInstance) {
        chartInstance.destroy()
      }
      
      // Crear nueva instancia de Chart
      new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Paz y Salvos Generados',
              data: pazYSalvos,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: 'rgba(16, 185, 129, 1)',
              fill: true
            },
            {
              label: 'Consultas Realizadas',
              data: consultas,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: 'rgba(59, 130, 246, 1)',
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                boxWidth: 6
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      })
    }

    loadChart()
    
    // Limpieza al desmontar el componente
    return () => {
      if (chartRef.current) {
        const chartInstance = Chart.getChart(chartRef.current)
        if (chartInstance) {
          chartInstance.destroy()
        }
      }
    }
  }, [labels, pazYSalvos, consultas])

  return (
    <div className="relative h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}
