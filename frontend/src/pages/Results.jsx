// frontend/src/pages/Results.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import * as web3 from '../utils/web3';

// ✅ Import Party Logos
import logo1 from '../assets/logos/logo1.jpeg';
import logo2 from '../assets/logos/logo2.png';
import logo3 from '../assets/logos/logo3.png';
import logo4 from '../assets/logos/logo4.jpeg';
import logo5 from '../assets/logos/logo5.jpeg';
import logo6 from '../assets/logos/logo6.jpeg';
import logo7 from '../assets/logos/logo7.png';

const Results = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { isConnected, connectWallet, address } = useWeb3();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [resultsTime, setResultsTime] = useState('');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [voters, setVoters] = useState([]);
  const [showVoters, setShowVoters] = useState(false);

  // ✅ Updated candidates with logos
  const allCandidates = [
    { id: 0, name: 'Sher Bahadur Deuba', party: 'Nepali Congress', logo: logo1 },
    { id: 1, name: 'KP Sharma Oli', party: 'CPN-UML', logo: logo2 },
    { id: 2, name: 'Pushpa Kamal Dahal', party: 'CPN-Maoist Centre', logo: logo3 },
    { id: 3, name: 'Rabi Lamichhane', party: 'Rastriya Swatantra Party', logo: logo4 },
    { id: 4, name: 'Rajendra Lingden', party: 'Rastriya Prajatantra Party', logo: logo5 },
    { id: 5, name: 'Upendra Yadav', party: 'Janata Samajbadi Party', logo: logo6 },
    { id: 6, name: 'Narayan Kaji Shrestha', party: 'Shram Sanskrti Party', logo: logo7 },
  ];

  // Check if user is admin
  useEffect(() => {
    if (user?.isVerified) {
      setIsAdmin(true);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResultsFromBlockchain();
      if (isAdmin) {
        fetchVoters();
      }
    }
  }, [isAuthenticated, isConnected, isAdmin]);

  // ✅ Fetch results from blockchain
  const fetchResultsFromBlockchain = async () => {
    setLoading(true);
    setError('');

    try {
      if (!isConnected) {
        await connectWallet();
      }

      const signer = await web3.getSigner();
      if (!signer) {
        setError('Please connect your wallet to view results');
        setLoading(false);
        return;
      }

      const candidates = await web3.getCandidates(signer);
      console.log('📊 Blockchain candidates:', candidates);

      if (candidates.length === 0) {
        setError('No candidates found on blockchain');
        setLoading(false);
        return;
      }

      const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
      const sortedCandidates = [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

      const resultsWithLogos = sortedCandidates.map(c => {
        const candidateInfo = allCandidates.find(ac => ac.id === c.id);
        return {
          ...c,
          logo: candidateInfo?.logo || null,
          party: candidateInfo?.party || c.party || 'Unknown'
        };
      });

      setResults({
        election: {
          title: 'Presidential Election 2024',
          description: 'Vote for your preferred candidate',
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalVotes: totalVotes
        },
        results: resultsWithLogos,
        summary: {
          totalVotes: totalVotes,
          winner: resultsWithLogos.length > 0 ? resultsWithLogos[0] : null,
          winningParty: resultsWithLogos.length > 0 ? resultsWithLogos[0]?.party : null
        }
      });

    } catch (err) {
      console.error('Error fetching results from blockchain:', err);
      const mockCandidates = allCandidates.map(c => ({
        id: c.id,
        name: c.name,
        party: c.party,
        logo: c.logo,
        voteCount: c.id === 0 ? 1248 : Math.floor(Math.random() * 800)
      }));
      setResults({
        election: {
          title: 'Presidential Election 2024',
          description: 'Vote for your preferred candidate',
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalVotes: mockCandidates.reduce((sum, c) => sum + c.voteCount, 0)
        },
        results: mockCandidates.sort((a, b) => b.voteCount - a.voteCount),
        summary: {
          totalVotes: mockCandidates.reduce((sum, c) => sum + c.voteCount, 0),
          winner: mockCandidates[0],
          winningParty: mockCandidates[0]?.party
        }
      });
      setError('Using demo data - Connect wallet for live results');
    }
    setLoading(false);
  };

  const fetchVoters = async () => {
    try {
      setVoters([
        { address: '0x9f789398...d671', candidate: 'Ram Prasad Sharma', timestamp: new Date().toISOString() },
        { address: '0x7a8b9c...1234', candidate: 'Khadga Prasad Oli', timestamp: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error('Error fetching voters:', error);
    }
  };

  const toggleResultsVisibility = () => {
    setShowResults(!showResults);
  };

  const handleSetResultsTime = (e) => {
    e.preventDefault();
    const time = new Date(resultsTime);
    alert(`Results will be visible after: ${time.toLocaleString()}`);
    setIsEditingTime(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md border border-gray-100">
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center text-4xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Login Required</h2>
            <p className="text-gray-600 mb-8">Please login to view election results</p>
            <a href="/login" className="inline-block px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/30">
              Login to Continue
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-6 text-gray-500 font-medium">Loading live election results...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
            <div className="text-6xl mb-6">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Results Available</h2>
            <p className="text-gray-600 mb-8">There are currently no election results to display.</p>
            <button onClick={fetchResultsFromBlockchain} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all active:scale-95">
              Refresh Results
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/40">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl mt-4">
        {/* Elegant Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-5 py-2 rounded-full border border-gray-200/50 shadow-sm mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-700 tracking-wide">LIVE • BLOCKCHAIN VERIFIED</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Election <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Results</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm tracking-wide">Real-time • Transparent • Immutable</p>
        </div>

        {/* Admin Controls - Clean & Minimal */}
        {isAdmin && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={toggleResultsVisibility}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                showResults 
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              {showResults ? '👁️ Public' : '🔒 Private'}
            </button>
            <button
              onClick={() => setIsEditingTime(!isEditingTime)}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-gray-200 transition-all"
            >
              ⏰ Schedule
            </button>
            <button
              onClick={() => setShowVoters(!showVoters)}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-gray-200 transition-all"
            >
              👥 {showVoters ? 'Hide Voters' : 'Voters'}
            </button>
            <button
              onClick={fetchResultsFromBlockchain}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-gray-200 transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {/* Schedule Modal */}
        {isEditingTime && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-6 mb-8 max-w-xl mx-auto">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">⏰ Set Results Time</h3>
            <form onSubmit={handleSetResultsTime} className="flex flex-col sm:flex-row gap-3">
              <input
                type="datetime-local"
                value={resultsTime}
                onChange={(e) => setResultsTime(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all">Save</button>
                <button type="button" onClick={() => setIsEditingTime(false)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Status Banner */}
        <div className={`mb-8 px-6 py-4 rounded-2xl flex items-center gap-4 ${showResults ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
          <span className="text-2xl">{showResults ? '✅' : '🔒'}</span>
          <div>
            <p className={`font-medium ${showResults ? 'text-emerald-700' : 'text-rose-700'}`}>
              {showResults ? 'Results are publicly visible' : 'Results are currently hidden'}
            </p>
            <p className="text-sm text-gray-600">{showResults ? 'All authenticated users can see the live tally' : 'Only administrators can view results'}</p>
          </div>
        </div>

        {!isConnected && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium">Wallet not connected</p>
                <p className="text-sm">Connect your wallet to verify live blockchain data</p>
              </div>
            </div>
            <button onClick={connectWallet} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-all">Connect Wallet</button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-2xl text-sm flex items-start gap-3">
            <span>ℹ️</span>
            <p>{error}</p>
          </div>
        )}

        {(showResults || isAdmin) && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{results.summary?.totalVotes || 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Leader</p>
                <p className="text-lg font-bold text-emerald-600 mt-2 truncate">{results.summary?.winner?.name || '—'}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Leading Party</p>
                <p className="text-lg font-bold text-violet-600 mt-2 truncate">{results.summary?.winningParty || '—'}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Candidates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{results.results?.length || 0}</p>
              </div>
            </div>

            {/* Candidate Results */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Candidate Results</h2>
                <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">LIVE</span>
              </div>

              <div className="p-6 space-y-6">
                {results.results?.map((candidate, index) => {
                  const totalVotes = results.summary?.totalVotes || 1;
                  const percentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
                  const isWinner = index === 0 && candidate.voteCount > 0;

                  return (
                    <div key={candidate.id || index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          {candidate.logo ? (
                            <img src={candidate.logo} alt={candidate.party} className="w-10 h-10 object-contain rounded-xl border border-gray-100" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">🏛️</div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{candidate.name}</p>
                              {isWinner && <span className="text-amber-500 text-sm">👑</span>}
                            </div>
                            <p className="text-xs text-gray-500">{candidate.party}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{candidate.voteCount}</p>
                          <p className="text-xs text-gray-500">{percentage}%</p>
                        </div>
                      </div>

                      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isWinner ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap justify-between text-xs text-gray-400 bg-gray-50">
                <span>🗳️ {results.election?.title}</span>
                <span>📅 Ends: {new Date(results.election?.endDate).toLocaleDateString()}</span>
                {isAdmin && <span className="text-blue-600 font-medium">🔐 Admin</span>}
              </div>
            </div>
          </>
        )}

        {/* Voters List */}
        {isAdmin && showVoters && (
          <div className="mt-8 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">👥 Voters</h2>
              <span className="text-xs text-gray-400">Blockchain Log</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Voted For</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {voters.length > 0 ? (
                    voters.map((voter, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-gray-600">{voter.address}</td>
                        <td className="px-6 py-3 font-medium">{voter.candidate}</td>
                        <td className="px-6 py-3 text-xs text-gray-500">{new Date(voter.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-400">No votes recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!showResults && !isAdmin && (
          <div className="mt-12 bg-white rounded-3xl shadow-xl p-16 text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Results Not Yet Published</h2>
            <p className="text-gray-600 max-w-md mx-auto">Official results will be published once the election period concludes.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Results;