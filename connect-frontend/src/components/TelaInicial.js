import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/TelaInicial.css";
import { useNavigate } from 'react-router-dom';

function TelaInicial() {
    const cadastroBtnRef = React.useRef(null);
    const navigate = useNavigate();
    const irParaCadastro = () => {
        navigate('/cadastro');
    };
    const [activeBenefit, setActiveBenefit] = useState(null);
    const [hoveredBenefit, setHoveredBenefit] = useState(null);
    const handleBenefitClick = (index) => {
        setActiveBenefit(index);
    
        // Scroll até o botão de cadastro
        if (cadastroBtnRef.current) {
            cadastroBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
            // Adiciona classe para o "pump"
            cadastroBtnRef.current.classList.add('pulse-button');
    
            // Remove a animação depois de um tempo para permitir novos cliques
            setTimeout(() => {
                cadastroBtnRef.current.classList.remove('pulse-button');
            }, 800);
        }
    };

    const handleMouseEnter = (index) => {
        setHoveredBenefit(index);
    };

    const handleMouseLeave = () => {
        setHoveredBenefit(null);
    };

    return (
        <div>
            <nav
                className="navbar fixed-top px-4"
                style={{
                    background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(255, 0, 0, 0.52))",
                    backdropFilter: "blur(1.5px)",
                }}
            >
                <div className="container-fluid d-flex justify-content-between align-items-center flex-row">
                    {/* logo */}
                    <a className="navbar-brand text-white fw-bold m-0" href="/">
                        <img
                            src="/images/logo-fatecconnect.png"
                            alt="Logo"
                            style={{ height: "40px" }}
                        />
                    </a>

                    {/* botão de login */}
                    <a
                        href="/login"
                        className="btn btn-light text-danger fw-bold px-4 py-2 rounded-pill m-0"
                    >
                        Login
                    </a>
                </div>
            </nav>

            <section className="position-relative" style={{ height: '76vh', backgroundColor: '#b80000' }}>
                {/* Imagem de fundo */}
                <img
                    src="/images/banner-fatecconnect.png"
                    alt="Banner FatecConnect"
                    className="w-100 h-100 object-fit-cover"
                    style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                />

                {/* texto sobre a imagem */}
                <div
                    className="position-relative z-2 text-white d-flex flex-column justify-content-center align-items-center text-center h-100 px-3"
                    style={{ zIndex: 2 }}
                >
                    <h2 className="fw-light mb-4" style={{ maxWidth: '800px' }}>
                        “Onde Dúvidas se Transformam em <br />
                        Aprendizado e Conexões Criam <br />
                        Oportunidades!”
                    </h2>
                    <button
                        ref={cadastroBtnRef}
                        onClick={irParaCadastro}
                        className="btn btn-light text-danger fw-bold px-4 py-2 rounded-pill"
                        style={{ marginTop: '25px', padding: '40px' }}
                    >
                        CADASTRE-SE
                    </button>
                </div>

                {/* overlay escura para contraste */}
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }}
                ></div>
            </section>

            {/* seção dos icones */}
            <section className="text-center py-5">
                <h4 className="text-danger fw-bold mb-5">
                    CADASTRE-SE E APROVEITE
                </h4>

                <div className="cadastro-beneficios">

                    {/* dúvidas */}
                    <div
                        className={`beneficio ${activeBenefit === 0 ? 'active' : ''}`}
                        onClick={() => handleBenefitClick(0)}
                        onMouseEnter={() => handleMouseEnter(0)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="icone">
                            <img src="images/icone-duvida.png" alt="Ícone Dúvidas" style={{ width: 35 }} />
                        </div>
                        <div className="texto">
                            <h5>DÚVIDAS</h5>
                            <p>Plataforma com alta gama<br />de informações</p>
                        </div>
                    </div>

                    {/* mentoria */}
                    <div
                        className={`beneficio ${activeBenefit === 1 ? 'active' : ''}`}
                        onClick={() => handleBenefitClick(1)}
                        onMouseEnter={() => handleMouseEnter(1)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="icone">
                            <img src="images/icone-mentoria.png" alt="Ícone Mentoria" style={{ width: 35 }} />
                        </div>
                        <div className="texto">
                            <h5>MENTORIA</h5>
                            <p>Agende sua mentoria para<br />adequar-se ao seu dia a dia</p>
                        </div>
                    </div>
                </div>

                {/* bolinhas de navegação */}
                <div className="bolinha-container">
                    <div className={`bolinha ${hoveredBenefit === 0 || activeBenefit === 0 ? 'active' : ''}`}></div>
                    <div className={`bolinha ${hoveredBenefit === 1 || activeBenefit === 1 ? 'active' : ''}`}></div>
                </div>
            </section>
        </div>
    );
}

export default TelaInicial;
