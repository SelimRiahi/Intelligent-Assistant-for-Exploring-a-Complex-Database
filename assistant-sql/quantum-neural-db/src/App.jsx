import React, { useState, useEffect, useRef } from 'react';
import { Download, Clock, Database, Zap, FileText, Search, RefreshCw, Trash2, Copy, Eye, ChevronDown, ChevronUp } from 'lucide-react';

const QuantumNeuralInterface = () => {
  const [phrase, setPhrase] = useState('');
  const [dbConfig, setDbConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [neuralNodes, setNeuralNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [queryResult, setQueryResult] = useState(null);
  const [hologramActive, setHologramActive] = useState(false);
  const [quantumField, setQuantumField] = useState([]);
  const [brainWaves, setBrainWaves] = useState([]);
  const [processingStage, setProcessingStage] = useState(0);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [resultView, setResultView] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [expandedQueries, setExpandedQueries] = useState({});

  // Initialize quantum neural network (simplified for performance)
  useEffect(() => {
    const nodes = [];
    const cons = [];
    
    // Reduced number of nodes for better performance
    for (let i = 0; i < 60; i++) {
      nodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 50,
        pulse: Math.random() * 2 * Math.PI,
        energy: Math.random(),
        type: ['input', 'hidden', 'output'][Math.floor(Math.random() * 3)],
        connections: []
      });
    }

    // Reduced connections for performance
    nodes.forEach((node, i) => {
      const nearbyNodes = nodes.filter((other, j) => {
        if (i === j) return false;
        const distance = Math.sqrt(
          Math.pow(node.x - other.x, 2) + 
          Math.pow(node.y - other.y, 2) + 
          Math.pow(node.z - other.z, 2)
        );
        return distance < 20;
      });
      
      // Limit connections per node
      nearbyNodes.slice(0, 3).forEach(nearby => {
        cons.push({
          from: node,
          to: nearby,
          strength: Math.random(),
          active: false
        });
      });
    });

    setNeuralNodes(nodes);
    setConnections(cons);

    // Reduced quantum field particles
    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        energy: Math.random(),
        phase: Math.random() * 2 * Math.PI
      });
    }
    setQuantumField(particles);

    // Reduced brain waves
    const waves = [];
    for (let i = 0; i < 4; i++) {
      waves.push({
        id: i,
        frequency: Math.random() * 0.01 + 0.005,
        amplitude: Math.random() * 15 + 10,
        phase: Math.random() * 2 * Math.PI,
        color: ['#ff0080', '#0080ff', '#80ff00', '#ff8000'][i]
      });
    }
    setBrainWaves(waves);
  }, []);

  // Simplified animation loop with reduced frequency
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralNodes(prev => prev.map(node => ({
        ...node,
        pulse: node.pulse + 0.04,
        energy: Math.sin(node.pulse + Date.now() * 0.0005) * 0.3 + 0.7,
        z: node.z + Math.sin(Date.now() * 0.0005 + node.id) * 0.1
      })));

      setQuantumField(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + 100) % 100,
        y: (particle.y + particle.vy + 100) % 100,
        phase: particle.phase + 0.01,
        energy: Math.sin(particle.phase) * 0.3 + 0.7
      })));

      // Simplified connection activation
      setConnections(prev => prev.map(conn => ({
        ...conn,
        active: Math.random() < 0.1,
        strength: Math.sin(Date.now() * 0.001 + conn.from.id) * 0.3 + 0.7
      })));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Simplified mouse interaction
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        
        const serverMatch = text.match(/'server':\s*'([^']+)'/);
        const databaseMatch = text.match(/'database':\s*'([^']+)'/);
        const usernameMatch = text.match(/'username':\s*'([^']+)'/);
        const passwordMatch = text.match(/'password':\s*'([^']+)'/);
        
        if (serverMatch && databaseMatch && usernameMatch && passwordMatch) {
          const config = {
            server: serverMatch[1],
            database: databaseMatch[1],
            username: usernameMatch[1],
            password: passwordMatch[1]
          };
          
          await configureDatabaseConnection(config);
        } else {
          alert('Format de fichier invalide. Utilisez le format DB_CONFIG Python correct.');
        }
      } catch (error) {
        alert('Erreur de lecture: ' + error.message);
      }
    }
  };

  const configureDatabaseConnection = async (config) => {
    setIsLoading(true);
    setHologramActive(true);
    
    try {
      const response = await fetch('http://localhost:7071/api/set-db-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setDbConfig(config);
        setTimeout(() => {
          setNeuralNodes(prev => prev.map(node => ({
            ...node,
            energy: node.type === 'input' ? 1 : node.energy
          })));
        }, 500);
        alert('Base de données connectée avec succès!');
      } else {
        alert('Connexion échouée: ' + result.message);
        setHologramActive(false);
      }
    } catch (error) {
      alert('Erreur de connexion: ' + error.message);
      setHologramActive(false);
    }
    
    setIsLoading(false);
  };

  const handleQuantumQuery = async () => {
    if (!phrase.trim() || !dbConfig) {
      alert('Configurez la base et entrez une requête!');
      return;
    }

    setIsLoading(true);
    setProcessingStage(0);

    const stages = ['Analyse Neurale', 'Traitement Quantique', 'Synchronisation DB', 'Matérialisation'];
    
    for (let i = 0; i < stages.length; i++) {
      setProcessingStage(i);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setNeuralNodes(prev => prev.map(node => ({
        ...node,
        energy: node.type === ['input', 'hidden', 'hidden', 'output'][i] ? 1 : node.energy * 0.7
      })));
    }

    try {
      const response = await fetch('http://localhost:7071/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: phrase })
      });
      
      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'partial') {
        // Handle the new multi-query result format
        const newResult = {
          id: Date.now(),
          timestamp: new Date().toLocaleString('fr-FR'),
          query: phrase,
          multiQuery: true,
          totalQueries: result.total_queries,
          successfulQueries: result.successful_queries,
          failedQueries: result.failed_queries,
          totalExecutionTime: result.total_execution_time_ms,
          results: result.results || [],
          confidence: 0.95,
          neuralScore: Math.random() * 0.3 + 0.7,
          quantumCoherence: Math.random() * 0.2 + 0.8
        };
        
        setQueryResult(newResult);
        setQueryHistory(prev => [newResult, ...prev.slice(0, 19)]);
        setCurrentPage(1);
        setSelectedQueryIndex(0);
        
        // Auto-expand first query if successful
        if (result.results && result.results.length > 0) {
          setExpandedQueries({ 0: true });
        }
      } else {
        alert('Requête échouée: ' + result.message);
      }
    } catch (error) {
      alert('Erreur d\'exécution: ' + error.message);
    }

    setIsLoading(false);
    setProcessingStage(0);
  };

  const exportToCSV = () => {
    if (!queryResult?.results?.length) return;
    
    const selectedQuery = queryResult.results[selectedQueryIndex];
    if (!selectedQuery?.results?.length) return;
    
    const headers = Object.keys(selectedQuery.results[0]);
    const csvContent = [
      headers.join(','),
      ...selectedQuery.results.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_query_${selectedQueryIndex + 1}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers!');
  };

  const loadHistoryQuery = (historyItem) => {
    setQueryResult(historyItem);
    setPhrase(historyItem.query);
    setShowHistory(false);
    setSelectedQueryIndex(0);
  };

  const toggleQueryExpansion = (index) => {
    setExpandedQueries(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Get current query data for display
  const getCurrentQueryData = () => {
    if (!queryResult?.results?.length || selectedQueryIndex >= queryResult.results.length) {
      return null;
    }
    return queryResult.results[selectedQueryIndex];
  };

  const currentQueryData = getCurrentQueryData();
  
  // Pagination logic for current query
  const totalPages = currentQueryData?.results ? Math.ceil(currentQueryData.results.length / rowsPerPage) : 0;
  const paginatedResults = currentQueryData?.results?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  ) || [];

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Simplified Background Effects */}
      <div className="absolute inset-0">
        {quantumField.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.energy * 3}px`,
              height: `${particle.energy * 3}px`,
              background: `radial-gradient(circle, rgba(0, 255, 255, ${particle.energy * 0.5}), transparent 70%)`,
              transform: `scale(${particle.energy})`,
            }}
          />
        ))}
      </div>

      {/* Simplified Neural Network */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {connections.map((conn, i) => conn.active && (
          <line
            key={i}
            x1={`${conn.from.x}%`}
            y1={`${conn.from.y}%`}
            x2={`${conn.to.x}%`}
            y2={`${conn.to.y}%`}
            stroke="#00ffff"
            strokeWidth={conn.strength * 2}
            filter="url(#glow)"
            opacity={conn.strength * 0.6}
          />
        ))}

        {neuralNodes.map(node => (
          <circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={Math.max(2, node.energy * 4)}
            fill={node.type === 'input' ? '#00ffff' : node.type === 'output' ? '#ff00ff' : '#ffff00'}
            opacity={node.energy * 0.7}
            filter="url(#glow)"
          />
        ))}

        {brainWaves.map(wave => (
          <path
            key={wave.id}
            d={`M 0 ${50 + Math.sin(Date.now() * wave.frequency + wave.phase) * wave.amplitude} 
                Q 25 ${50 + Math.sin(Date.now() * wave.frequency + wave.phase + 1) * wave.amplitude} 
                50 ${50 + Math.sin(Date.now() * wave.frequency + wave.phase + 2) * wave.amplitude} 
                T 100 ${50 + Math.sin(Date.now() * wave.frequency + wave.phase + 3) * wave.amplitude}`}
            stroke={wave.color}
            strokeWidth="2"
            fill="none"
            opacity="0.5"
            filter="url(#glow)"
          />
        ))}
      </svg>

      {/* Simplified Mouse Follower */}
      <div 
        className="absolute pointer-events-none z-20"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-16 h-16 border border-cyan-400/30 rounded-full animate-spin" />
      </div>

      <div className="relative z-10 min-h-screen p-4">
        {/* Title */}
        <div className="text-center mb-8 relative">
          <h1 className="text-6xl lg:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            QUANTUM NEURAL DB
          </h1>
          <p className="text-xl text-gray-300">Intelligence Artificielle • Base de Données • Interface Quantique</p>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Control Panel */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-xl text-purple-400 hover:bg-purple-500/30 transition-all duration-300"
            >
              <Clock className="w-5 h-5" />
              <span>Historique ({queryHistory.length})</span>
            </button>
            
            {queryResult && (
              <>
                <button
                  onClick={exportToCSV}
                  disabled={!currentQueryData?.results?.length}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl text-green-400 hover:bg-green-500/30 transition-all duration-300 disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  <span>Export CSV</span>
                </button>
                
                <div className="flex items-center space-x-2 bg-black/40 rounded-xl border border-gray-600/30 overflow-hidden">
                  {['table', 'json'].map(view => (
                    <button
                      key={view}
                      onClick={() => setResultView(view)}
                      className={`px-4 py-3 transition-all duration-300 ${
                        resultView === view 
                          ? 'bg-cyan-500/30 text-cyan-400' 
                          : 'text-gray-400 hover:text-cyan-400'
                      }`}
                    >
                      {view === 'table' ? <Database className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="relative">
              <div className="relative bg-black/80 backdrop-blur-2xl border border-purple-400/40 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-purple-400 flex items-center space-x-3">
                    <Clock className="w-6 h-6" />
                    <span>Historique Quantique</span>
                  </h3>
                  <button
                    onClick={() => setQueryHistory([])}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Effacer</span>
                  </button>
                </div>
                
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {queryHistory.map(item => (
                    <div 
                      key={item.id}
                      className="bg-black/40 border border-purple-400/20 rounded-xl p-4 hover:border-purple-400/40 transition-all duration-300 cursor-pointer"
                      onClick={() => loadHistoryQuery(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 font-mono text-sm">{item.timestamp}</span>
                        <span className="text-green-400 text-sm font-bold">
                          {item.multiQuery ? `${item.successfulQueries}/${item.totalQueries} queries` : item.operation}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{item.query}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        {item.multiQuery ? (
                          <>
                            <span>{item.totalQueries} requêtes</span>
                            <span>{item.totalExecutionTime}ms</span>
                          </>
                        ) : (
                          <>
                            <span>{item.rowCount || item.affectedRows || 0} lignes</span>
                            <span>{item.executionTime}</span>
                          </>
                        )}
                        <span>{((item.quantumCoherence || 0.8) * 100).toFixed(1)}% cohérence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Database Config + Query Input */}
            <div className="space-y-6">
              {/* Database Configuration */}
              <div className="relative">
                <div className="relative bg-black/70 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-6">
                  {!dbConfig ? (
                    <div className="text-center">
                      <label className="cursor-pointer group">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept=".py,.txt"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        <div className="flex flex-col items-center space-y-4 p-6">
                          <div className="w-20 h-20 border-4 border-emerald-400/50 rounded-2xl flex items-center justify-center group-hover:border-emerald-300 transition-all duration-300">
                            <Database className="w-8 h-8 text-emerald-400" />
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                              Configuration Base
                            </h3>
                            <p className="text-gray-400">Uploadez votre db_config.py</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-emerald-400 font-bold text-lg flex items-center space-x-2">
                          <Database className="w-5 h-5" />
                          <span>Base Connectée</span>
                        </h4>
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                      </div>
                      <div className="bg-black/50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Serveur:</span>
                          <span className="text-emerald-300 font-mono">{dbConfig.server}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Base:</span>
                          <span className="text-emerald-300 font-mono">{dbConfig.database}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Statut:</span>
                          <span className="text-emerald-400 font-bold">QUANTUM LINKED</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDbConfig(null);
                          setHologramActive(false);
                          setQueryResult(null);
                        }}
                        className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-all duration-300"
                      >
                        Déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Query Input */}
              <div className="relative">
                <div className="relative bg-black/70 backdrop-blur-2xl border border-purple-500/40 rounded-3xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-purple-400 uppercase tracking-wider">
                      Interface Neurale
                    </h3>
                  </div>
                  
                  <textarea
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    placeholder="Formulez votre requête... 'Montre tous les utilisateurs', 'Clients avec plus de 5 commandes', 'Statistiques des ventes'..."
                    rows={6}
                    className="w-full bg-black/50 border-2 border-purple-500/30 rounded-2xl p-4 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 resize-none"
                  />
                  
                  <div className="flex items-center justify-end mt-4">
                    <button
                      onClick={handleQuantumQuery}
                      disabled={!phrase.trim() || !dbConfig || isLoading}
                      className="relative px-8 py-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full text-white font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm">
                            {['Analyse', 'Traitement', 'Synchro', 'Résultat'][processingStage]}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>Exécuter</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="space-y-6">
              {queryResult && (
                <div className="relative">
                  <div className="relative bg-black/80 backdrop-blur-2xl border-2 border-green-400/50 rounded-3xl overflow-hidden">
                    {/* Results Header */}
                    <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 p-6 border-b border-green-400/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-green-400 flex items-center space-x-3">
                          <Eye className="w-6 h-6" />
                          <span>Résultats Quantiques</span>
                        </h3>
                        <div className="flex items-center space-x-4">
                          {queryResult.multiQuery && (
                            <div className="px-3 py-1 bg-blue-400/20 rounded-full border border-blue-400/30">
                              <span className="text-blue-400 text-sm font-bold">
                                {queryResult.successfulQueries}/{queryResult.totalQueries} OK
                              </span>
                            </div>
                          )}
                          <div className="px-3 py-1 bg-cyan-400/20 rounded-full border border-cyan-400/30">
                            <span className="text-cyan-400 text-sm font-bold">
                              {queryResult.multiQuery ? `${queryResult.totalExecutionTime}ms` : queryResult.executionTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Query List for Multiple Queries */}
                      {queryResult.multiQuery && (
                        <div className="space-y-2 mb-4">
                          <h4 className="text-green-300 text-sm font-bold uppercase tracking-wider">
                            Requêtes Exécutées ({queryResult.results.length}):
                          </h4>
                          {queryResult.results.map((queryData, index) => (
                            <div
                              key={index}
                              className={`bg-black/40 rounded-xl p-3 border cursor-pointer transition-all duration-300 ${
                                selectedQueryIndex === index 
                                  ? 'border-green-400/50 bg-green-500/20' 
                                  : 'border-gray-600/30 hover:border-green-400/30'
                              }`}
                              onClick={() => {
                                setSelectedQueryIndex(index);
                                setCurrentPage(1);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    queryData.status === 'success' 
                                      ? 'bg-green-400/20 text-green-400' 
                                      : 'bg-red-400/20 text-red-400'
                                  }`}>
                                    Query {index + 1}
                                  </span>
                                  <span className={`text-sm font-bold ${
                                    queryData.status === 'success' ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {queryData.status === 'success' ? queryData.operation : 'ERROR'}
                                  </span>
                                  {queryData.status === 'success' && (
                                    <span className="text-xs text-gray-400">
                                      {queryData.row_count || queryData.affected_rows || 0} lignes
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-400">
                                    {queryData.execution_time_ms}ms
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleQueryExpansion(index);
                                    }}
                                    className="text-gray-400 hover:text-green-400"
                                  >
                                    {expandedQueries[index] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              
                              {expandedQueries[index] && (
                                <div className="mt-3 p-3 bg-black/60 rounded-lg border border-gray-600/20">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-green-300 text-xs font-bold uppercase">SQL:</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(queryData.sql_query);
                                      }}
                                      className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <pre className="text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                                    {queryData.sql_query}
                                  </pre>
                                  {queryData.status === 'error' && (
                                    <div className="mt-2 p-2 bg-red-500/20 rounded border border-red-400/30">
                                      <span className="text-red-400 text-xs">{queryData.message}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Current Query Display for Single Results */}
                      {!queryResult.multiQuery && queryResult.sql && (
                        <div className="bg-black/60 rounded-xl p-4 border border-green-400/30 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-300 text-sm font-bold uppercase tracking-wider">SQL Généré:</span>
                            <button
                              onClick={() => copyToClipboard(queryResult.sql)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                            >
                              <Copy className="w-3 h-3" />
                              <span className="text-xs">Copier</span>
                            </button>
                          </div>
                          <pre className="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                            {queryResult.sql}
                          </pre>
                        </div>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="bg-black/40 rounded-xl p-3 text-center border border-cyan-400/20">
                          <div className="text-2xl font-bold text-cyan-400">
                            {queryResult.multiQuery 
                              ? queryResult.totalQueries 
                              : (currentQueryData?.row_count || currentQueryData?.affected_rows || queryResult.rowCount || queryResult.affectedRows || 0)
                            }
                          </div>
                          <div className="text-cyan-300 text-xs uppercase">
                            {queryResult.multiQuery ? 'Requêtes' : 'Lignes'}
                          </div>
                        </div>
                        
                        <div className="bg-black/40 rounded-xl p-3 text-center border border-purple-400/20">
                          <div className="text-2xl font-bold text-purple-400">
                            {queryResult.multiQuery 
                              ? queryResult.successfulQueries 
                              : `${((queryResult.confidence || 0.95) * 100).toFixed(1)}%`
                            }
                          </div>
                          <div className="text-purple-300 text-xs uppercase">
                            {queryResult.multiQuery ? 'Succès' : 'Confiance'}
                          </div>
                        </div>
                        
                        <div className="bg-black/40 rounded-xl p-3 text-center border border-yellow-400/20">
                          <div className="text-2xl font-bold text-yellow-400">
                            {((queryResult.quantumCoherence || 0.8) * 100).toFixed(1)}%
                          </div>
                          <div className="text-yellow-300 text-xs uppercase">Cohérence</div>
                        </div>
                        
                        <div className="bg-black/40 rounded-xl p-3 text-center border border-pink-400/20">
                          <div className="text-2xl font-bold text-pink-400">
                            {((queryResult.neuralScore || 0.85) * 100).toFixed(1)}%
                          </div>
                          <div className="text-pink-300 text-xs uppercase">Neural</div>
                        </div>
                      </div>
                    </div>

                    {/* Results Content */}
                    <div className="p-6">
                      {/* Current Query Status */}
                      {queryResult.multiQuery && currentQueryData && (
                        <div className="mb-6 p-4 bg-black/40 rounded-xl border border-green-400/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-green-400 font-bold">
                              Requête {selectedQueryIndex + 1} - {currentQueryData.operation}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              currentQueryData.status === 'success' 
                                ? 'bg-green-400/20 text-green-400' 
                                : 'bg-red-400/20 text-red-400'
                            }`}>
                              {currentQueryData.status === 'success' ? 'SUCCÈS' : 'ERREUR'}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{currentQueryData.message}</p>
                        </div>
                      )}

                      {/* Error Display */}
                      {currentQueryData?.status === 'error' && (
                        <div className="bg-red-500/20 rounded-xl p-4 border border-red-400/30 mb-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 bg-red-400 rounded-full" />
                            <span className="text-red-400 font-bold">Erreur d'Exécution</span>
                          </div>
                          <p className="text-red-300">{currentQueryData.message}</p>
                        </div>
                      )}

                      {/* Success with Data */}
                      {currentQueryData?.status === 'success' && currentQueryData.results && currentQueryData.results.length > 0 ? (
                        <>
                          {/* View Selector */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <span className="text-green-300 font-bold">Mode d'affichage:</span>
                              <div className="flex bg-black/50 rounded-xl border border-gray-600/30 overflow-hidden">
                                {[
                                  { key: 'table', icon: Database, label: 'Table' },
                                  { key: 'json', icon: FileText, label: 'JSON' }
                                ].map(({ key, icon: Icon, label }) => (
                                  <button
                                    key={key}
                                    onClick={() => setResultView(key)}
                                    className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 ${
                                      resultView === key 
                                        ? 'bg-cyan-500/30 text-cyan-400' 
                                        : 'text-gray-400 hover:text-cyan-400'
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && resultView === 'table' && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                  disabled={currentPage === 1}
                                  className="px-3 py-1 bg-gray-600/20 border border-gray-500/30 rounded-lg text-gray-400 disabled:opacity-50 hover:bg-gray-600/30 transition-all duration-300"
                                >
                                  ←
                                </button>
                                <span className="text-gray-300 text-sm">
                                  {currentPage} / {totalPages}
                                </span>
                                <button
                                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                  disabled={currentPage === totalPages}
                                  className="px-3 py-1 bg-gray-600/20 border border-gray-500/30 rounded-lg text-gray-400 disabled:opacity-50 hover:bg-gray-600/30 transition-all duration-300"
                                >
                                  →
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Table View */}
                          {resultView === 'table' && (
                            <div className="bg-black/60 rounded-xl border border-green-400/30 overflow-hidden">
                              <div className="overflow-x-auto max-h-96">
                                <table className="w-full">
                                  <thead className="bg-gradient-to-r from-green-500/30 to-cyan-500/30 sticky top-0">
                                    <tr>
                                      {Object.keys(currentQueryData.results[0] || {}).map(key => (
                                        <th key={key} className="text-green-400 text-left p-3 font-bold text-sm uppercase tracking-wider border-b border-green-400/20">
                                          {key}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paginatedResults.map((row, i) => (
                                      <tr 
                                        key={i} 
                                        className="border-b border-green-400/10 hover:bg-green-400/5 transition-all duration-200"
                                        style={{
                                          background: `linear-gradient(90deg, 
                                            rgba(0, 255, 255, ${0.02 + (i % 2) * 0.02}) 0%, 
                                            rgba(255, 0, 255, ${0.01 + (i % 2) * 0.01}) 100%)`
                                        }}
                                      >
                                        {Object.values(row).map((value, j) => (
                                          <td key={j} className="text-green-300 p-3 text-sm">
                                            <div className="max-w-xs truncate">
                                              {value === null || value === undefined ? (
                                                <span className="text-gray-500 italic">NULL</span>
                                              ) : (
                                                String(value)
                                              )}
                                            </div>
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              
                              {currentQueryData.results.length > rowsPerPage && (
                                <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 p-3 text-center">
                                  <span className="text-green-400 text-sm">
                                    Affichage {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, currentQueryData.results.length)} de {currentQueryData.results.length} résultats
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* JSON View */}
                          {resultView === 'json' && (
                            <div className="bg-black/60 rounded-xl border border-green-400/30 p-4 max-h-96 overflow-auto">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-green-400 font-bold text-sm uppercase">Format JSON:</span>
                                <button
                                  onClick={() => copyToClipboard(JSON.stringify(currentQueryData.results, null, 2))}
                                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span className="text-xs">Copier JSON</span>
                                </button>
                              </div>
                              <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap">
                                {JSON.stringify(currentQueryData.results, null, 2)}
                              </pre>
                            </div>
                          )}
                        </>
                      ) : currentQueryData?.status === 'success' ? (
                        /* Success without data (INSERT/UPDATE/DELETE) */
                        <div className="text-center py-12">
                          <Database className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <p className="text-green-400 text-lg font-bold">
                            {currentQueryData.operation} exécuté avec succès
                          </p>
                          <p className="text-gray-400 text-sm mt-2">{currentQueryData.message}</p>
                          {currentQueryData.affected_rows && (
                            <p className="text-green-300 text-sm mt-2">
                              {currentQueryData.affected_rows} ligne(s) affectée(s)
                            </p>
                          )}
                        </div>
                      ) : !queryResult.multiQuery ? (
                        /* No results for single query */
                        <div className="text-center py-12">
                          <Database className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">
                            {queryResult.operation === 'SELECT' 
                              ? 'Aucun résultat trouvé' 
                              : `${queryResult.operation} exécuté avec succès`}
                          </p>
                          <p className="text-gray-500 text-sm mt-2">{queryResult.message}</p>
                        </div>
                      ) : (
                        /* Multi-query with no selected or no results */
                        <div className="text-center py-12">
                          <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">
                            Sélectionnez une requête ci-dessus pour voir les résultats
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions Panel */}
              {queryResult && (
                <div className="relative">
                  <div className="relative bg-black/70 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-4">
                    <h4 className="text-blue-400 font-bold mb-3 uppercase tracking-wider text-sm">Actions Rapides</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <button
                        onClick={exportToCSV}
                        disabled={!currentQueryData?.results?.length}
                        className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-400/30 rounded-xl text-green-400 hover:bg-green-500/30 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4 group-hover:animate-bounce" />
                        <span className="text-sm">Export CSV</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const sqlToCopy = queryResult.multiQuery && currentQueryData 
                            ? currentQueryData.sql_query 
                            : queryResult.sql;
                          copyToClipboard(sqlToCopy || '');
                        }}
                        className="flex items-center space-x-2 p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-400 hover:bg-blue-500/30 transition-all duration-300 group"
                      >
                        <Copy className="w-4 h-4 group-hover:animate-pulse" />
                        <span className="text-sm">Copier SQL</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setPhrase('');
                          setQueryResult(null);
                        }}
                        className="flex items-center space-x-2 p-3 bg-purple-500/20 border border-purple-400/30 rounded-xl text-purple-400 hover:bg-purple-500/30 transition-all duration-300 group"
                      >
                        <RefreshCw className="w-4 h-4 group-hover:animate-spin" />
                        <span className="text-sm">Nouveau</span>
                      </button>
                      
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center space-x-2 p-3 bg-orange-500/20 border border-orange-400/30 rounded-xl text-orange-400 hover:bg-orange-500/30 transition-all duration-300 group"
                      >
                        <Clock className="w-4 h-4 group-hover:animate-pulse" />
                        <span className="text-sm">Historique</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insights Panel */}
              {queryResult && (
                <div className="relative">
                  <div className="relative bg-black/70 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-4">
                    <h4 className="text-purple-400 font-bold mb-3 uppercase tracking-wider text-sm flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Analyse IA</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Confiance IA</span>
                          <span className="text-purple-400 font-bold">
                            {queryResult.multiQuery 
                              ? `${Math.round((queryResult.successfulQueries / queryResult.totalQueries) * 100)}%`
                              : `${((queryResult.confidence || 0.95) * 100).toFixed(1)}%`
                            }
                          </span>
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                            style={{ 
                              width: queryResult.multiQuery 
                                ? `${(queryResult.successfulQueries / queryResult.totalQueries) * 100}%`
                                : `${(queryResult.confidence || 0.95) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Score Neural</span>
                          <span className="text-cyan-400 font-bold">{((queryResult.neuralScore || 0.85) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(queryResult.neuralScore || 0.85) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Cohérence Quantique</span>
                          <span className="text-yellow-400 font-bold">{((queryResult.quantumCoherence || 0.8) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(queryResult.quantumCoherence || 0.8) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-black/40 rounded-xl border border-purple-400/20">
                      <p className="text-purple-300 text-sm">
                        <span className="font-bold text-purple-400">Analyse:</span> 
                        {queryResult.multiQuery 
                          ? `${queryResult.successfulQueries} requête(s) exécutée(s) avec succès sur ${queryResult.totalQueries} total.`
                          : (queryResult.message || currentQueryData?.message || 'Requête traitée avec succès.')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions Panel */}
          {dbConfig && !queryResult && (
            <div className="relative">
              <div className="relative bg-black/70 backdrop-blur-xl border border-yellow-400/30 rounded-2xl p-6">
                <h4 className="text-yellow-400 font-bold mb-4 uppercase tracking-wider flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Requêtes Suggérées</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Montre toutes les tables',
                    'Compte le nombre d\'utilisateurs',
                    'Liste les 10 dernières commandes',
                    'Trouve les clients les plus actifs',
                    'Statistiques des ventes par mois',
                    'Produits les plus vendus'
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setPhrase(suggestion)}
                      className="text-left p-3 bg-black/40 border border-yellow-400/20 rounded-xl text-yellow-300 hover:border-yellow-400/40 hover:bg-yellow-500/10 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full group-hover:animate-ping" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantum Corner Effects */}
      {[
        { position: 'top-0 left-0', border: 'border-l-4 border-t-4', color: 'cyan-400', delay: '0s' },
        { position: 'top-0 right-0', border: 'border-r-4 border-t-4', color: 'purple-400', delay: '0.5s' },
        { position: 'bottom-0 left-0', border: 'border-l-4 border-b-4', color: 'pink-400', delay: '1s' },
        { position: 'bottom-0 right-0', border: 'border-r-4 border-b-4', color: 'emerald-400', delay: '1.5s' }
      ].map((corner, i) => (
        <div key={i} className={`absolute ${corner.position} w-24 h-24`}>
          <div className={`w-full h-full ${corner.border} border-${corner.color}/40`}>
            <div 
              className={`absolute ${corner.position.includes('top') ? 'top-0' : 'bottom-0'} ${corner.position.includes('left') ? 'left-0' : 'right-0'} w-3 h-3 bg-${corner.color} rounded-full animate-ping`}
              style={{ animationDelay: corner.delay }}
            />
          </div>
        </div>
      ))}

      {/* Processing Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative">
            <div className="relative bg-black/90 border-2 border-purple-400/50 rounded-3xl p-12 text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                <div className="w-6 h-6 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }} />
                <div className="w-4 h-4 border-4 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" style={{ animationDelay: '0.4s' }} />
              </div>
              
              <h3 className="text-2xl font-bold text-purple-400 mb-2">
                {['Analyse Neurale en cours...', 'Traitement Quantique...', 'Synchronisation Base...', 'Matérialisation des Résultats...'][processingStage]}
              </h3>
              
              <div className="w-64 bg-black/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((processingStage + 1) / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumNeuralInterface;