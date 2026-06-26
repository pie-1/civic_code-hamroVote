// frontend/src/pages/Vote.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import * as faceapi from 'face-api.js';
import * as web3 from '../utils/web3';

import VoteTimer from '../components/voting/VoteTimer';
import VoteStatus from '../components/voting/VoteStatus';
import VoteCamera from '../components/voting/VoteCamera';
import VoteActions from '../components/voting/VoteActions';

// ✅ Import Party Logos
import logo1 from '../assets/logos/logo1.jpeg';
import logo3 from '../assets/logos/logo3.png';
import logo2 from '../assets/logos/logo2.png';
import logo4 from '../assets/logos/logo4.jpeg';
import logo5 from '../assets/logos/logo5.jpeg';
import logo6 from '../assets/logos/logo6.jpeg';
import logo7 from '../assets/logos/logo7.png';

const Vote = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connectWallet, disconnectWallet, address } = useWeb3();

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [emotions, setEmotions] = useState(null);
  const [dominantEmotion, setDominantEmotion] = useState('');
  const [stressDetected, setStressDetected] = useState(false);
  const [emotionBlocked, setEmotionBlocked] = useState(false);
  const [multiPersonDetected, setMultiPersonDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [voterInfo, setVoterInfo] = useState(null);
  const [voterId, setVoterId] = useState('');
  const [storedFaceDescriptor, setStoredFaceDescriptor] = useState(null);
  const [faceMatchPercentage, setFaceMatchPercentage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ✅ Updated: Real Nepali political parties with LOGOS
  const allCandidates = [
    { 
      id: 0, 
      name: 'Sher Bahadur Deuba', 
      party: 'Nepali Congress', 
      logo: logo1,
      district: 'Kathmandu-1' 
    },
    { 
      id: 1, 
      name: 'KP Sharma Oli', 
      party: 'CPN-UML', 
      logo: logo2,
      district: 'Kathmandu-1' 
    },
    { 
      id: 2, 
      name: 'Pushpa Kamal Dahal', 
      party: 'CPN-Maoist Centre', 
      logo: logo3,
      district: 'Kathmandu-1' 
    },
    { 
      id: 3, 
      name: 'Rabi Lamichhane', 
      party: 'Rastriya Swatantra Party', 
      logo: logo4,
      district: 'Kathmandu-1' 
    },
    { 
      id: 4, 
      name: 'Rajendra Lingden', 
      party: 'Rastriya Prajatantra Party', 
      logo: logo5,
      district: 'Kathmandu-1' 
    },
    { 
      id: 5, 
      name: 'Upendra Yadav', 
      party: 'Janata Samajbadi Party', 
      logo: logo6,
      district: 'Kathmandu-1' 
    },
    { 
      id: 6, 
      name: 'Narayan Kaji Shrestha', 
      party: 'Shram Sanskrti Party', 
      logo: logo7,
      district: 'Kathmandu-1' 
    },
  ];

  // Load voter data
  useEffect(() => {
    const voterData = localStorage.getItem('voterData');
    const storedVoterId = localStorage.getItem('voterId');
    
    if (!voterData || !storedVoterId) {
      setError('Please verify your Voter Card first');
      setTimeout(() => navigate('/profile'), 2000);
      return;
    }

    try {
      const data = JSON.parse(voterData);
      if (data.faceDescriptor) {
        setStoredFaceDescriptor(data.faceDescriptor);
      } else {
        setError('⚠️ Face descriptor not found. Please verify your Voter Card again.');
        setTimeout(() => navigate('/profile'), 2000);
      }
      if (data.name || data.district) {
        setVoterInfo({
          name: data.name || user?.name || '',
          constituency: data.constituency || 'Kathmandu-1',
          district: data.district || 'Kathmandu'
        });
      }
    } catch (e) {
      console.error('Error loading voter data:', e);
      setError('⚠️ Invalid voter data. Please verify your Voter Card again.');
    }
  }, [navigate, user]);

  // ✅ Load candidates
  useEffect(() => {
    setCandidates(allCandidates);
    console.log('✅ Candidates loaded with logos:', allCandidates.length);
  }, []);

  // Load face models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Error loading face models:', err);
        setError('Failed to load face models. Please refresh.');
      }
    };
    loadModels();
  }, []);

  // Timer
  useEffect(() => {
    if (isVotingActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && isVotingActive) {
      setIsVotingActive(false);
      setError('⏰ Voting time expired. Please try again.');
      stopWebcam();
    }
  }, [isVotingActive, timeLeft]);

  // Camera handlers
  const startWebcam = async () => {
    try {
      if (stream) stream.getTracks().forEach(track => track.stop());
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 800, height: 600, facingMode: 'user' }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setIsCameraOn(true);
        setError('');
        setSuccess('');
        setMultiPersonDetected(false);
        setFaceCount(0);
        setFaceMatchPercentage(null);
      }
    } catch (err) {
      console.error('Webcam error:', err);
      setError('Please allow camera access');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
      setIsVotingActive(false);
      setTimeLeft(300);
      setFaceVerified(false);
      setEmotions(null);
      setDominantEmotion('');
      setStressDetected(false);
      setEmotionBlocked(false);
      setMultiPersonDetected(false);
      setFaceCount(0);
      setFaceMatchPercentage(null);
      if (videoRef.current) videoRef.current.srcObject = null;
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  // Verify face
  const verifyFace = async () => {
    if (!videoRef.current || !modelsLoaded) {
      setError('Please wait for camera and models to load');
      return;
    }

    if (!storedFaceDescriptor) {
      setError('⚠️ Please verify your Voter Card first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setEmotionBlocked(false);
    setMultiPersonDetected(false);
    setFaceMatchPercentage(null);

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

      const faceCount = detections.length;
      setFaceCount(faceCount);

      if (faceCount > 1) {
        setMultiPersonDetected(true);
        setError(`🚫 Multiple people detected (${faceCount} faces). Please vote alone.`);
        setFaceVerified(false);
        setLoading(false);
        return;
      }

      if (faceCount === 0) {
        setError('❌ No face detected. Please look at the camera.');
        setFaceVerified(false);
        setLoading(false);
        return;
      }

      const detection = detections[0];
      const liveDescriptor = detection.descriptor;
      
      const distance = faceapi.euclideanDistance(
        new Float32Array(storedFaceDescriptor),
        liveDescriptor
      );
      const matchPercentage = Math.max(0, Math.min(100, (1 - distance) * 100));
      setFaceMatchPercentage(matchPercentage);

      if (matchPercentage < 60) {
        setError(`❌ Face match too low (${matchPercentage.toFixed(1)}%). Please try again.`);
        setFaceVerified(false);
        setLoading(false);
        return;
      }

      const expressions = detection.expressions;
      setEmotions(expressions);

      const dominant = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      setDominantEmotion(dominant);

      const blockedEmotions = ['sad', 'fearful', 'angry', 'disgusted'];
      const isBlocked = blockedEmotions.includes(dominant);
      const hasBlockedEmotion = blockedEmotions.some(e => expressions[e] > 0.4);

      if (isBlocked || hasBlockedEmotion) {
        setEmotionBlocked(true);
        setError(`❌ Voting blocked: ${dominant.toUpperCase()} emotion detected. Please calm down.`);
        setFaceVerified(false);
        setLoading(false);
        return;
      }

      const stressEmotions = ['fearful', 'sad', 'angry', 'disgusted'];
      const hasStress = stressEmotions.some(e => expressions[e] > 0.3);
      setStressDetected(hasStress);

      setFaceVerified(true);
      setIsVotingActive(true);

      if (hasStress) {
        setSuccess(`⚠️ Face verified (${matchPercentage.toFixed(1)}%) but stress detected. Vote flagged for review.`);
      } else {
        setSuccess(`✅ Face verified! (${matchPercentage.toFixed(1)}% match) You have 5 minutes to vote.`);
      }

      setTimeLeft(300);
    } catch (err) {
      console.error('Face verification error:', err);
      setError('Face verification failed');
    }
    setLoading(false);
  };

  // Handle vote
  const handleVote = async () => {
    console.log('🔍 handleVote called');
    console.log('🔍 isConnected:', isConnected);
    console.log('🔍 selectedCandidate:', selectedCandidate);

    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet');
      const result = await connectWallet();
      if (!result?.success) {
        setError('Wallet connection failed. Please try again.');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!faceVerified) {
      setError('Please verify your face first');
      return;
    }

    if (emotionBlocked) {
      setError('❌ Voting blocked due to negative emotion.');
      return;
    }

    if (multiPersonDetected) {
      setError('❌ Voting blocked: Multiple people detected.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const signer = await web3.getSigner();
      if (!signer) {
        setError('Please connect your wallet');
        setLoading(false);
        return;
      }

      const alreadyVoted = await web3.hasVoted(signer);
      if (alreadyVoted) {
        setError('You have already voted on the blockchain!');
        setLoading(false);
        return;
      }

      const result = await web3.castVote(signer, selectedCandidate.id);
      
      if (result.success) {
        const etherscanLink = `https://sepolia.etherscan.io/tx/${result.txHash}`;
        setSuccess(
          <div className="space-y-2">
            <div className="font-semibold text-green-600">✅ Vote cast for {selectedCandidate.name}!</div>
            <div className="text-sm">
              <a 
                href={etherscanLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                🔗 View Transaction on Etherscan
              </a>
            </div>
            <div className="text-xs text-gray-400">
              Transaction: {result.txHash.slice(0, 16)}...{result.txHash.slice(-8)}
            </div>
          </div>
        );
        setHasVoted(true);
        setFaceVerified(false);
        setIsVotingActive(false);
        stopWebcam();
      } else {
        setError(`❌ Vote failed: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Voting error:', err);
      setError(`Failed to cast vote: ${err.message}`);
    }
    setLoading(false);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  if (hasVoted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
            <div className="text-6xl mb-4">🗳️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Voting!</h2>
            <p className="text-gray-500">Your vote has been recorded securely on the blockchain.</p>
            {typeof success === 'object' && success}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🗳️ Cast Your Vote</h1>

        {voterInfo && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-4">
            <p className="text-sm">
              <strong>Voter:</strong> {voterInfo.name} | <strong>Constituency:</strong> {voterInfo.constituency} | <strong>District:</strong> {voterInfo.district}
            </p>
          </div>
        )}

        <VoteStatus
          error={error}
          success={success}
          multiPersonDetected={multiPersonDetected}
          faceCount={faceCount}
          emotionBlocked={emotionBlocked}
          faceMatchPercentage={faceMatchPercentage}
          faceVerified={faceVerified}
        />

        <VoteTimer timeLeft={timeLeft} isVotingActive={isVotingActive} />

        <VoteCamera
          isCameraOn={isCameraOn}
          startWebcam={startWebcam}
          stopWebcam={stopWebcam}
          verifyFace={verifyFace}
          loading={loading}
          faceVerified={faceVerified}
          modelsLoaded={modelsLoaded}
          faceCount={faceCount}
          emotions={emotions}
          dominantEmotion={dominantEmotion}
          stressDetected={stressDetected}
          emotionBlocked={emotionBlocked}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />

        {/* ✅ Candidates Section with LOGOS */}
        {faceVerified && !emotionBlocked && !multiPersonDetected && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Select Your Candidate
              {voterInfo && (
                <span className="text-sm text-gray-500 ml-2">
                  (District: {voterInfo.district} | Constituency: {voterInfo.constituency})
                </span>
              )}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`cursor-pointer p-4 rounded-xl border-2 text-center transition ${
                    selectedCandidate?.id === candidate.id
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <img 
                      src={candidate.logo} 
                      alt={candidate.party}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <p className="font-semibold text-sm">{candidate.name}</p>
                  <p className="text-xs text-gray-500">{candidate.party}</p>
                  <p className="text-xs text-gray-400 mt-1">{candidate.district}</p>
                </div>
              ))}
            </div>
            
            {selectedCandidate && (
              <p className="text-center text-sm text-blue-600 mt-3">
                Selected: {selectedCandidate.name} ({selectedCandidate.party}) - {selectedCandidate.district}
              </p>
            )}
          </div>
        )}

        <VoteActions
          isConnected={isConnected}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          loading={loading}
          faceVerified={faceVerified}
          emotionBlocked={emotionBlocked}
          multiPersonDetected={multiPersonDetected}
          selectedCandidate={selectedCandidate}
          handleVote={handleVote}
          address={address}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Vote;