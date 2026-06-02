import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { IconCode, IconCoffee, IconHeart } from "../components/Icons";
import "./FuelDevs.css";

const FuelDevs = () => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    message: "",
    paymentMethod: "CARD"
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");

  const fuelLevels = [
    {
      id: "first-time",
      name: "Primera vez viendo esto",
      amount: 3000,
      description: "Un RedBull de supervivencia",
      icon: IconCoffee,
      color: "#4ade80"
    },
    {
      id: "interesting",
      name: "Me gusta la idea",
      amount: 8000,
      description: "Pizza de medianoche para pensar",
      icon: IconCode,
      color: "#2cb9b0"
    },
    {
      id: "awesome",
      name: "Esto está genial",
      amount: 15000,
      description: "Snacks para la próxima maratón",
      icon: IconHeart,
      color: "#7f5af0"
    },
    {
      id: "rockstar",
      name: "Son unos cracks",
      amount: 30000,
      description: "Fondo para el siguiente imposible",
      icon: IconCode,
      color: "#e040fb"
    }
  ];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setShowForm(true);
    // Scroll suave hacia el formulario con un pequeño delay para que la animación se vea
    setTimeout(() => {
      const formElement = document.getElementById('donor-form');
      if (formElement) {
        const navbarHeight = 80; // Altura aproximada del navbar
        const targetPosition = formElement.offsetTop - navbarHeight - 20; // 20px extra de padding
        window.scrollTo({ 
          top: targetPosition, 
          behavior: 'smooth' 
        });
      }
    }, 150); // Delay para que la animación del form se muestre primero
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value && parseInt(value) >= 1000) { // Mínimo 1000 COP
      setSelectedAmount(parseInt(value));
      setShowForm(true);
      // Scroll suave si no está visible el formulario
      setTimeout(() => {
        const formElement = document.getElementById('donor-form');
        if (formElement) {
          const navbarHeight = 80;
          const targetPosition = formElement.offsetTop - navbarHeight - 20;
          window.scrollTo({ 
            top: targetPosition, 
            behavior: 'smooth' 
          });
        }
      }, 150);
    } else {
      setShowForm(false);
    }
  };

  const handleFuel = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Validación mejorada
    if (!donorInfo.name.trim()) {
      setErrorMessage("Por favor ingresa tu nombre completo");
      setLoading(false);
      return;
    }

    if (!donorInfo.email.trim() || !donorInfo.email.includes('@')) {
      setErrorMessage("Por favor ingresa un email válido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/wompi/crear-transaccion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: 'COP',
          customerEmail: donorInfo.email.trim(),
          customerName: donorInfo.name.trim(),
          reference: `FUEL_${Date.now()}`,
          description: donorInfo.message.trim() || 'Donación Fuel para Developers',
          paymentMethod: donorInfo.paymentMethod
        }),
      });

      console.log('📡 Response status:', response.status);
      
      // Verificar si la respuesta es válida antes de parsear JSON
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Respuesta no es JSON:', text);
        throw new Error('El servidor no respondió con JSON válido');
      }

      const data = await response.json();
      
      console.log('🔄 Respuesta del servidor:', data);
      console.log('🔍 data.success:', data.success);
      console.log('🔍 data.data:', data.data);
      
      if (data.data) {
        console.log('🔍 Contenido de data.data:', JSON.stringify(data.data, null, 2));
        console.log('🔍 data.data.checkoutUrl:', data.data.checkoutUrl);
        console.log('🔍 data.data.permalink:', data.data.permalink);
      }

      if (data.success && data.data) {
        // Verificar tanto checkoutUrl como permalink (Wompi puede usar cualquiera)
        const checkoutUrl = data.data.checkoutUrl || data.data.permalink;
        
        if (checkoutUrl) {
          console.log('✅ URL de pago encontrada:', checkoutUrl);
          setSuccessMessage("¡Perfecto! Cargando checkout...");
          
          // Crear modal con iframe integrado
          setTimeout(() => {
            setShowCheckoutModal(true);
            setCheckoutUrl(checkoutUrl);
          }, 800);
        } else {
          console.warn('⚠️ No se encontró URL de pago en la respuesta');
          console.log('📋 Respuesta completa:', JSON.stringify(data, null, 2));
          setErrorMessage('La transacción se procesó pero no se recibió la URL de pago.');
        }
      } else {
        console.error('❌ Error en los datos:', data);
        setErrorMessage(
          data.mensaje || 
          (data.error && data.error.reason) || 
          'Error al procesar la donación. Intenta nuevamente.'
        );
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      if (error.message.includes('HTTP 502')) {
        setErrorMessage('Error de servidor. Verifica que el backend esté ejecutándose.');
      } else if (error.message.includes('Failed to fetch')) {
        setErrorMessage('Error de conexión. Verifica tu internet.');
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
    } finally {
      if (!successMessage) {
        setLoading(false);
      }
    }
  };

  const resetSelection = () => {
    setSelectedAmount(null);
    setCustomAmount("");
    setShowForm(false);
    setDonorInfo({ name: "", email: "", message: "", paymentMethod: "CARD" });
    setErrorMessage("");
    setSuccessMessage("");
    setShowCheckoutModal(false);
    setCheckoutUrl("");
  };

  const handleCloseModal = () => {
    setShowCheckoutModal(false);
    setCheckoutUrl("");
    // Reset form after closing
    setTimeout(() => {
      resetSelection();
    }, 300);
  };

  return (
    <div className="fuel-page">
      <Navbar />
      
      <div className="fuel-container">
        <div className="fuel-header">
          <div className="fuel-badge">
            <div className="fuel-badge-dot" />
            Proyecto estudiantil
          </div>
          
          <h1 className="fuel-title">
            Fuel para Developers
          </h1>
          
          <p className="fuel-subtitle">
            Desarrollado con 73% persistencia y 27% Stack Overflow
          </p>
        </div>

        <div className="fuel-story">
          <div className="story-section">
            <h2>La Historia</h2>
            <p>
              Este proyecto empezó con la frase más peligrosa de la programación: 
              <strong> "No puede ser tan difícil..."</strong>
            </p>
            <p className="spoiler">Spoiler alert: SÍ era tan difícil.</p>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">47</div>
                <div className="stat-label">Noches de insomnio productivo</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">156</div>
                <div className="stat-label">Búsquedas desesperadas</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">23</div>
                <div className="stat-label">Crisis por punto y coma</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1</div>
                <div className="stat-label">Momento épico final</div>
              </div>
            </div>

            <p className="final-message">
              Aquí tienes DigitalHub. <strong>Gratis para siempre.</strong><br />
              Porque la persistencia estudiantil no tiene precio.
            </p>
          </div>
        </div>

        <div className="fuel-section">
          <h2>¿Quieres patrocinar la próxima aventura?</h2>
          <p>Combustible para developers persistentes:</p>

          <div className="fuel-levels">
            {fuelLevels.map((level) => {
              const Icon = level.icon;
              return (
                <div 
                  key={level.id}
                  className={`fuel-card ${selectedAmount === level.amount ? 'selected' : ''}`}
                  onClick={() => handleAmountSelect(level.amount)}
                  style={{ '--card-color': level.color }}
                >
                  <div className="fuel-card-icon">
                    <Icon size={24} />
                  </div>
                  <h3>{level.name}</h3>
                  <div className="fuel-amount">${level.amount.toLocaleString()}</div>
                  <p>{level.description}</p>
                  <div className="fuel-card-action">
                    {selectedAmount === level.amount ? '✓ Seleccionado' : 'Seleccionar'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="custom-amount">
            <label htmlFor="custom">O ingresa tu cantidad:</label>
            <input
              id="custom"
              type="number"
              placeholder="Cantidad personalizada"
              value={customAmount}
              onChange={handleCustomAmount}
              min="1000"
              step="1000"
            />
          </div>

          {showForm && (
            <div id="donor-form" className="donor-form">
              <div className="form-header">
                <h3>Formulario de Pago</h3>
                <div className="selected-amount">
                  Total: <strong>${selectedAmount?.toLocaleString()}</strong>
                  <button className="change-amount" onClick={resetSelection}>
                    Cambiar
                  </button>
                </div>
              </div>
              
              {/* Mensajes de estado */}
              {errorMessage && (
                <div className="message-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {errorMessage}
                </div>
              )}
              
              {successMessage && (
                <div className="message-success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                  {successMessage}
                </div>
              )}
              
              <div className="form-content">
                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="name">Nombre completo *</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="email">Correo electrónico *</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="amount">Valor a pagar *</label>
                    <div className="amount-display">
                      <span className="currency">$</span>
                      <span className="amount-value">{selectedAmount?.toLocaleString()}</span>
                      <span className="currency-code">COP</span>
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="paymentMethod">Método de pago *</label>
                    <select
                      id="paymentMethod"
                      value={donorInfo.paymentMethod}
                      onChange={(e) => setDonorInfo({...donorInfo, paymentMethod: e.target.value})}
                      disabled={loading}
                    >
                      <option value="CARD">💳 Tarjeta de crédito</option>
                      <option value="DEBIT">💳 Tarjeta débito</option>
                      <option value="PSE">🏦 PSE</option>
                      <option value="NEQUI">📱 Nequi</option>
                      <option value="BANCOLOMBIA">🏧 Bancolombia</option>
                    </select>
                  </div>
                </div>
                
                <div className="input-group">
                  <label htmlFor="message">Descripción del pago</label>
                  <textarea
                    id="message"
                    placeholder="Descripción opcional del pago..."
                    value={donorInfo.message}
                    onChange={(e) => setDonorInfo({...donorInfo, message: e.target.value})}
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${selectedAmount?.toLocaleString()}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total a pagar:</span>
                    <span>${selectedAmount?.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  className={`pay-button ${loading ? 'loading' : ''} ${successMessage ? 'success' : ''}`}
                  onClick={handleFuel}
                  disabled={!donorInfo.name.trim() || !donorInfo.email.trim() || loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      <span>Procesando...</span>
                    </>
                  ) : successMessage ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                      <span>¡Listo!</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                      <span>Pagar</span>
                    </>
                  )}
                </button>
                
                <p className="payment-info">
                  🔒 Pago procesado de forma segura a través de Wompi
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="fuel-footer">
          <p>¿Por qué hacemos esto gratis?</p>
          <p>
            Porque recordamos cuando éramos estudiantes buscando proyectos chéveres 
            en GitHub para aprender. Este es nuestro granito de arena al mundo 
            de developers que vienen detrás.
          </p>
          <p>¿Te suma? ¿Quieres sumar? Todo cool por aquí.</p>
          
          <Link to="/" className="back-home">
            Volver al inicio
          </Link>
        </div>
      </div>

      <Footer />

      {/* Modal de Checkout Personalizado */}
      {showCheckoutModal && (
        <div className="checkout-modal-overlay" onClick={handleCloseModal}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <div className="modal-title">
                <h3>Completar Pago</h3>
                <div className="payment-amount">
                  Total: <strong>${selectedAmount?.toLocaleString()} COP</strong>
                </div>
              </div>
              <button className="close-modal" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="checkout-modal-content">
              {checkoutUrl ? (
                <iframe
                  src={checkoutUrl}
                  title="Wompi Checkout"
                  className="checkout-iframe"
                  frameBorder="0"
                  allow="payment"
                />
              ) : (
                <div className="loading-checkout">
                  <div className="spinner" />
                  <p>Cargando checkout...</p>
                </div>
              )}
            </div>
            
            <div className="checkout-modal-footer">
              <p className="security-info">
                🔒 Pago procesado de forma segura por Wompi
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelDevs;