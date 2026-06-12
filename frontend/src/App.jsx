import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  History, 
  UploadCloud, 
  LogOut, 
  Sun, 
  Moon, 
  Terminal as TerminalIcon, 
  CheckCircle, 
  XCircle, 
  Play, 
  Server, 
  ShieldAlert, 
  CloudLightning,
  GitBranch,
  Settings2,
  Trash2,
  Download,
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : `http://${window.location.hostname}:5000`;

function InterviewQuestionItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className="card" 
      style={{ 
        padding: '16px 20px', 
        backgroundColor: 'var(--bg-tertiary)', 
        border: '1px solid var(--border-glass)', 
        cursor: 'pointer', 
        transition: 'all var(--transition-fast)' 
      }} 
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1 }}>
          <span style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '16px' }}>Q{index}.</span>
          <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-main)' }}>{question}</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '85px', textAlign: 'right' }}>
          {isOpen ? '▲ Hide Answer' : '▼ Show Answer'}
        </span>
      </div>
      {isOpen && (
        <div 
          style={{ 
            marginTop: '12px', 
            paddingTop: '12px', 
            borderTop: '1px solid var(--border-glass)', 
            fontSize: '14px', 
            lineHeight: '1.6', 
            color: 'var(--text-main)' 
          }}
        >
          <strong style={{ color: 'var(--status-success)', display: 'block', marginBottom: '4px' }}>Suggested Answer:</strong>
          {answer}
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [session, setSession] = useState(JSON.parse(localStorage.getItem('session')) || null);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Resume Analyzer State
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  // JD Matcher State
  const [jdText, setJdText] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdMatchResult, setJdMatchResult] = useState(null);
  const [isComparingJD, setIsComparingJD] = useState(false);

  // Interview Simulator State
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);

  // AI Summary Generator State
  const [selectedResumeIdForSummary, setSelectedResumeIdForSummary] = useState('');
  const [summaryTone, setSummaryTone] = useState('professional');
  const [summaryLength, setSummaryLength] = useState('balanced');
  const [summaryFocus, setSummaryFocus] = useState('general');
  const [summaryResult, setSummaryResult] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // AI Resume Builder State
  const [selectedResumeIdForBuilder, setSelectedResumeIdForBuilder] = useState('');
  const [builderTab, setBuilderTab] = useState('personal');
  const [isParsingSummary, setIsParsingSummary] = useState(false);
  const [builderResumeData, setBuilderResumeData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: '',
    experience: [{ id: '1', company: '', role: '', dates: '', bullets: '' }],
    education: [{ id: '1', degree: '', school: '', dates: '' }],
    projects: [{ id: '1', name: '', tech: '', desc: '' }],
    skills: {
      frontend: '',
      backend: '',
      database: '',
      devops: '',
      cloud: '',
      programming: ''
    },
    softSkills: '',
    hobbies: '',
    certifications: [{ id: '1', name: '' }]
  });

  // Application State
  const [flaskStatus, setFlaskStatus] = useState('offline');
  const [systemStats, setSystemStats] = useState({ cpu: 0, ram: 0, platform: '' });
  const [statsHistory, setStatsHistory] = useState([]);

  // DevOps Panel State
  const [devopsStatus, setDevopsStatus] = useState({
    githubRepo: '',
    jenkinsUrl: '',
    dockerImage: '',
    awsHost: '',
    awsStatus: 'offline',
    dockerContainers: [],
    lastDeployTime: null,
    simulationMode: true,
    pipelineStatus: 'idle',
    pipelineProgress: 0
  });
  const [devopsLogs, setDevopsLogs] = useState([]);
  const [editedGithubRepo, setEditedGithubRepo] = useState('');
  const [editedJenkinsUrl, setEditedJenkinsUrl] = useState('');
  const [editedDockerImage, setEditedDockerImage] = useState('');
  const [editedAwsHost, setEditedAwsHost] = useState('');
  const [editedSimulationMode, setEditedSimulationMode] = useState(true);

  const terminalEndRef = useRef(null);

  // Auto-scroll terminal logs to bottom
  useEffect(() => {
    if (activeTab === 'devops' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [devopsLogs, activeTab]);

  // Sync DevOps config inputs with status when not deploying
  useEffect(() => {
    if (devopsStatus.pipelineStatus !== 'running') {
      setEditedGithubRepo(devopsStatus.githubRepo || '');
      setEditedJenkinsUrl(devopsStatus.jenkinsUrl || '');
      setEditedDockerImage(devopsStatus.dockerImage || '');
      setEditedAwsHost(devopsStatus.awsHost || '');
      setEditedSimulationMode(devopsStatus.simulationMode !== undefined ? devopsStatus.simulationMode : true);
    }
  }, [
    devopsStatus.githubRepo,
    devopsStatus.jenkinsUrl,
    devopsStatus.dockerImage,
    devopsStatus.awsHost,
    devopsStatus.simulationMode,
    devopsStatus.pipelineStatus
  ]);

  // Apply theme class to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Periodic polling for stats and status
  useEffect(() => {
    fetchDevOpsStatus();
    fetchHistory();
    const interval = setInterval(() => {
      fetchDevOpsStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [session]);

  // Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email: authEmail, password: authPassword } : { email: authEmail, password: authPassword, name: authName };
    
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('session', JSON.stringify(data.user));
        setSession(data.user);
      } else {
        alert('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session');
    setSession(null);
  };

  // Fetch Resume Analysis History
  const fetchHistory = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/resume/history?userId=${session.id}`);
      const data = await res.json();
      if (res.ok) {
        setHistoryList(data);
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
  };

  // Delete History Item
  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this analysis record?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/resume/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  // Fetch Flask health and system resource status
  const fetchDevOpsStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/devops/status`);
      const data = await res.json();
      if (res.ok) {
        setFlaskStatus(data.flaskStatus);
        setSystemStats(data.system);
        setDevopsStatus(data);
        
        // Save history of resource usage for charts
        setStatsHistory(prev => {
          const updated = [...prev, {
            time: new Date().toLocaleTimeString().slice(0, 8),
            cpu: data.system.cpu || 0,
            ram: data.system.ram || 0
          }];
          return updated.slice(-15); // limit to 15 entries
        });

        // Fetch logs if deployment pipeline is active
        if (data.pipelineStatus === 'running') {
          fetchDeploymentLogs();
        }
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  };

  const fetchDeploymentLogs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/devops/logs`);
      const data = await res.json();
      if (res.ok) {
        setDevopsLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
  };

  const handleSaveDevOpsConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/devops/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubRepo: editedGithubRepo,
          jenkinsUrl: editedJenkinsUrl,
          dockerImage: editedDockerImage,
          awsHost: editedAwsHost,
          simulationMode: editedSimulationMode
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('DevOps Configuration updated successfully!');
        setDevopsStatus(data.config);
      } else {
        alert('Failed to save configuration: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving configuration');
    }
  };

  const handleTriggerDeploy = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/devops/deploy`, {
        method: 'POST'
      });
      if (res.ok) {
        setDevopsLogs([]);
        fetchDevOpsStatus();
      } else {
        const data = await res.json();
        alert('Deployment failed to trigger: ' + data.error);
      }
    } catch (e) {
      console.error('Failed to trigger deploy:', e);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/devops/logs/clear`, {
        method: 'POST'
      });
      if (res.ok) {
        setDevopsLogs([]);
        fetchDevOpsStatus();
      }
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  };

  // JD Matcher handler
  const handleCompareJD = async () => {
    if (!selectedResumeId || !jdText.trim()) {
      alert('Please select a resume and paste a Job Description.');
      return;
    }
    setIsComparingJD(true);
    setJdMatchResult(null);

    const selectedResume = historyList.find(h => h.id === selectedResumeId);
    if (!selectedResume) {
      alert('Selected resume not found.');
      setIsComparingJD(false);
      return;
    }

    try {
      // Find all text contents in skills categories to construct resume text
      const resumeSkillsText = Object.values(selectedResume.detectedSkills || {}).flat().join(" ");
      const resumeFullMockText = `${selectedResume.name} ${selectedResume.email} ${selectedResume.phone} ${resumeSkillsText}`;

      const res = await fetch(`${BACKEND_URL}/api/resume/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jdText,
          resume_text: resumeFullMockText,
          candidate_name: selectedResume.name
        })
      });
      const data = await res.json();
      if (res.ok) {
        setJdMatchResult(data);
      } else {
        throw new Error(data.error || 'Failed to compare');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setIsComparingJD(false);
    }
  };

  // Interview Answer Evaluation handler
  const handleEvaluateAnswer = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      alert('Please select a question and type your answer.');
      return;
    }
    setIsEvaluatingAnswer(true);
    setEvaluationResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/resume/evaluate_answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: selectedQuestion.question,
          answer: answerText
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEvaluationResult(data);
      } else {
        throw new Error(data.error || 'Failed to evaluate answer');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  // AI Resume Summary handler
  const handleGenerateSummary = async () => {
    if (!selectedResumeIdForSummary) {
      alert('Please select a resume.');
      return;
    }
    setIsGeneratingSummary(true);
    setSummaryResult(null);

    const selectedResume = historyList.find(h => h.id === selectedResumeIdForSummary);
    if (!selectedResume) {
      alert('Selected resume not found.');
      setIsGeneratingSummary(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/resume/generate_summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedResume.name,
          detectedSkills: selectedResume.detectedSkills,
          jobRecommendations: selectedResume.jobRecommendations,
          tone: summaryTone,
          length: summaryLength,
          focus: summaryFocus
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSummaryResult(data);
      } else {
        throw new Error(data.error || 'Failed to generate summary');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // AI Resume Builder Handlers
  const handlePrefillResumeBuilder = (resumeId) => {
    if (!resumeId) return;
    const selectedResume = historyList.find(h => h.id === resumeId);
    if (!selectedResume) {
      alert('Selected resume record not found.');
      return;
    }
    
    // Construct pre-filled resume builder state
    const detected = selectedResume.detectedSkills || {};
    const frontendSkills = (detected.Frontend || []).join(', ');
    const backendSkills = (detected.Backend || []).join(', ');
    const databaseSkills = (detected.Database || []).join(', ');
    const devopsSkills = (detected.DevOps || []).join(', ');
    const cloudSkills = (detected.Cloud || []).join(', ');
    const programmingSkills = (detected['Programming Skills'] || []).join(', ');
    
    const primaryRole = selectedResume.jobRecommendations && selectedResume.jobRecommendations[0]
      ? selectedResume.jobRecommendations[0].role
      : 'Software Engineer';
      
    // Pre-fill fields
    setBuilderResumeData({
      name: selectedResume.name || '',
      title: primaryRole,
      email: selectedResume.email && selectedResume.email !== 'Not Found' ? selectedResume.email : '',
      phone: selectedResume.phone && selectedResume.phone !== 'Not Found' ? selectedResume.phone : '',
      location: 'New York, USA',
      website: 'github.com/candidate-profile',
      summary: selectedResume.resumeSummary || '',
      experience: [
        { 
          id: '1', 
          company: 'Tech Solutions Corp', 
          role: `Junior ${primaryRole}`, 
          dates: '2024 - Present', 
          bullets: '- Designed and optimized software deployment layers to improve system uptime\n- Collaborated on developing scalable web architectures and RESTful APIs' 
        }
      ],
      education: [
        { 
          id: '1', 
          degree: 'Bachelor of Science in Computer Science', 
          school: 'State Engineering University', 
          dates: '2020 - 2024' 
        }
      ],
      projects: [
        { 
          id: '1', 
          name: 'Scalable Container Pipeline', 
          tech: 'Docker, AWS, Jenkins, Node.js', 
          desc: '- Containerized three microservices and hosted them on cloud architecture\n- Decreased automated build validation cycles by 30%' 
        }
      ],
      skills: {
        frontend: frontendSkills,
        backend: backendSkills,
        database: databaseSkills,
        devops: devopsSkills,
        cloud: cloudSkills,
        programming: programmingSkills
      }
    });
    
    alert(`Successfully loaded profile data for ${selectedResume.name}!`);
  };

  const handleAIParseSummary = async () => {
    if (!builderResumeData.summary.trim()) {
      alert('Please type or paste some summary notes first.');
      return;
    }
    
    setIsParsingSummary(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/resume/parse_builder_summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: builderResumeData.summary })
      });
      
      if (!res.ok) {
        throw new Error('Failed to parse summary');
      }
      
      const parsed = await res.json();
      
      // Update builderResumeData
      setBuilderResumeData(prev => {
        // 1. Distribute tech skills
        const updatedSkills = { ...prev.skills };
        const techSkillsMapping = {
          frontend: ['react', 'angular', 'vue', 'html5', 'css3', 'javascript', 'typescript', 'tailwind', 'bootstrap', 'jquery', 'nextjs', 'vite'],
          backend: ['node.js', 'nodejs', 'express', 'express.js', 'django', 'flask', 'spring boot', 'springboot', 'python', 'go', 'golang', 'php', 'ruby', 'c#', 'asp.net'],
          database: ['postgresql', 'postgres', 'mongodb', 'mysql', 'sqlite', 'redis', 'mariadb', 'cassandra', 'oracle', 'sql', 'nosql'],
          devops: ['docker', 'kubernetes', 'k8s', 'jenkins', 'ansible', 'terraform', 'git', 'github', 'gitlab', 'ci/cd', 'cicd', 'maven', 'gradle', 'prometheus', 'grafana', 'nagios'],
          cloud: ['aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean', 'ec2', 's3', 'rds', 'lambda'],
          programming: ['c', 'java', 'c++', 'pocd', 'dms']
        };
        
        if (parsed.tech_skills && parsed.tech_skills.length > 0) {
          parsed.tech_skills.forEach(skill => {
            const skillLower = skill.toLowerCase();
            let categoryFound = false;
            for (const [cat, list] of Object.entries(techSkillsMapping)) {
              if (list.includes(skillLower)) {
                categoryFound = true;
                const existing = updatedSkills[cat] ? updatedSkills[cat].split(',').map(s => s.trim()).filter(Boolean) : [];
                if (!existing.some(s => s.toLowerCase() === skillLower)) {
                  existing.push(skill);
                  updatedSkills[cat] = existing.join(', ');
                }
                break;
              }
            }
            if (!categoryFound) {
              const existing = updatedSkills.backend ? updatedSkills.backend.split(',').map(s => s.trim()).filter(Boolean) : [];
              if (!existing.some(s => s.toLowerCase() === skillLower)) {
                existing.push(skill);
                updatedSkills.backend = existing.join(', ');
              }
            }
          });
        }
        
        // 2. Soft skills
        let updatedSoftSkills = prev.softSkills;
        if (parsed.soft_skills && parsed.soft_skills.length > 0) {
          const existing = prev.softSkills ? prev.softSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
          parsed.soft_skills.forEach(skill => {
            if (!existing.some(s => s.toLowerCase() === skill.toLowerCase())) {
              existing.push(skill);
            }
          });
          updatedSoftSkills = existing.join(', ');
        }
        
        // 3. Projects
        let updatedProjects = [...prev.projects];
        if (parsed.projects && parsed.projects.length > 0) {
          const firstProj = updatedProjects[0];
          const isFirstProjEmpty = updatedProjects.length === 1 && (!firstProj.name && !firstProj.tech && !firstProj.desc);
          
          const newProjectsMapped = parsed.projects.map((name, idx) => ({
            id: (Date.now() + idx).toString(),
            name,
            tech: '',
            desc: '- Built project demonstrating key software skills'
          }));
          
          if (isFirstProjEmpty) {
            updatedProjects = newProjectsMapped;
          } else {
            newProjectsMapped.forEach(newP => {
              if (!updatedProjects.some(p => p.name.toLowerCase() === newP.name.toLowerCase())) {
                updatedProjects.push(newP);
              }
            });
          }
        }
        
        // 4. Certifications
        let updatedCertifications = [...prev.certifications];
        if (parsed.certificates && parsed.certificates.length > 0) {
          const firstCert = updatedCertifications[0];
          const isFirstCertEmpty = updatedCertifications.length === 1 && !firstCert.name;
          
          const newCertsMapped = parsed.certificates.map((name, idx) => ({
            id: (Date.now() + idx + 100).toString(),
            name
          }));
          
          if (isFirstCertEmpty) {
            updatedCertifications = newCertsMapped;
          } else {
            newCertsMapped.forEach(newC => {
              if (!updatedCertifications.some(c => c.name.toLowerCase() === newC.name.toLowerCase())) {
                updatedCertifications.push(newC);
              }
            });
          }
        }
        
        // 5. Education (schooling, PUC, engineering)
        let updatedEducation = [...prev.education];
        if (parsed.education && parsed.education.length > 0) {
          const firstEdu = updatedEducation[0];
          const isFirstEduEmpty = updatedEducation.length === 1 && (!firstEdu.degree && !firstEdu.school && !firstEdu.dates);
          
          const newEduMapped = parsed.education.map((edu, idx) => ({
            id: (Date.now() + idx + 200).toString(),
            degree: edu.degree,
            school: edu.school,
            dates: edu.dates
          }));
          
          if (isFirstEduEmpty) {
            updatedEducation = newEduMapped;
          } else {
            newEduMapped.forEach(newE => {
              if (!updatedEducation.some(e => e.school.toLowerCase() === newE.school.toLowerCase())) {
                updatedEducation.push(newE);
              }
            });
          }
        }
        
        // 6. Hobbies
        let updatedHobbies = prev.hobbies;
        if (parsed.hobbies && parsed.hobbies.trim()) {
          const existing = prev.hobbies ? prev.hobbies.split(',').map(h => h.trim()).filter(Boolean) : [];
          parsed.hobbies.split(',').map(h => h.trim()).forEach(hobby => {
            if (!existing.some(h => h.toLowerCase() === hobby.toLowerCase())) {
              existing.push(hobby);
            }
          });
          updatedHobbies = existing.join(', ');
        }
        
        return {
          ...prev,
          summary: parsed.summary || prev.summary,
          skills: updatedSkills,
          softSkills: updatedSoftSkills,
          projects: updatedProjects,
          certifications: updatedCertifications,
          education: updatedEducation,
          hobbies: updatedHobbies
        };
      });
      
      alert('AI parser successfully extracted and distributed elements to their respective tabs!');
    } catch (err) {
      console.error(err);
      alert('Failed to parse summary notes: ' + err.message);
    } finally {
      setIsParsingSummary(false);
    }
  };

  const handleExportBuilderResumePDF = () => {
    const data = builderResumeData;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Page constraints
    const pageHeight = 297;
    const margin = 15;
    const rightMargin = 195;
    const maxContentHeight = 275;
    let y = 20;
    
    // Name (Centered, uppercase, serif font)
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    const nameText = (data.name || 'CANDIDATE NAME').toUpperCase();
    doc.text(nameText, 105, y, { align: 'center' });
    y += 6.5;
    
    // Target Title / Role (Centered, italic, optional)
    if (data.title) {
      doc.setFont("times", "italic");
      doc.setFontSize(10.5);
      doc.setTextColor(80, 80, 80);
      doc.text(data.title.toUpperCase(), 105, y, { align: 'center' });
      y += 5.5;
    }
    
    // Contact details row (Centered, clean pipes, 100% ASCII to prevent font corruption)
    const contactParts = [];
    if (data.phone) contactParts.push(data.phone.trim());
    if (data.email) contactParts.push(data.email.trim());
    if (data.location) contactParts.push(data.location.trim());
    if (data.website) {
      const cleanSite = data.website.replace(/^(https?:\/\/)?(www\.)?/, '').trim();
      contactParts.push(cleanSite);
    }
    const contactStr = contactParts.join("   |   ");
    
    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(contactStr, 105, y, { align: 'center' });
    y += 8;
    
    // Helper to Add LaTeX-style Section Headers
    const addSectionTitle = (title) => {
      if (y > maxContentHeight - 15) {
        doc.addPage();
        y = 20;
      }
      y += 3;
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(title.toUpperCase(), margin, y);
      y += 1.8;
      
      // Elegant thin horizontal separator line
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(margin, y, rightMargin, y);
      y += 5.5;
    };
    
    // 1. Summary Section
    if (data.summary && data.summary.trim()) {
      addSectionTitle("Summary");
      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      const wrappedSummary = doc.splitTextToSize(data.summary.trim(), 180);
      wrappedSummary.forEach(line => {
        if (y > maxContentHeight) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 4.5;
      });
      y += 2.5;
    }
    
    // 2. Skills Section
    const validSkills = data.skills ? Object.entries(data.skills).filter(([cat, val]) => val && val.trim()) : [];
    const hasSoftSkills = data.softSkills && data.softSkills.trim();
    if (validSkills.length > 0 || hasSoftSkills) {
      addSectionTitle("Skills");
      
      validSkills.forEach(([category, skills]) => {
        if (y > maxContentHeight - 5) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont("times", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        // Format category name (e.g. frontend -> Frontend)
        let categoryLabel = category.charAt(0).toUpperCase() + category.slice(1) + ": ";
        if (category === 'programming') {
          categoryLabel = 'Programming Skills: ';
        }
        doc.text(categoryLabel, margin, y);
        const catWidth = doc.getTextWidth(categoryLabel);
        
        doc.setFont("times", "normal");
        doc.setTextColor(60, 60, 60);
        const wrappedSkills = doc.splitTextToSize(skills.trim(), 180 - catWidth);
        wrappedSkills.forEach((line, idx) => {
          if (idx > 0 && y > maxContentHeight) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin + catWidth, y);
          y += 4.5;
        });
        y += 0.8;
      });
      
      if (hasSoftSkills) {
        if (y > maxContentHeight - 5) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("times", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("Soft Skills: ", margin, y);
        const labelWidth = doc.getTextWidth("Soft Skills: ");
        
        doc.setFont("times", "normal");
        doc.setTextColor(60, 60, 60);
        const wrappedSoftSkills = doc.splitTextToSize(data.softSkills.trim(), 180 - labelWidth);
        wrappedSoftSkills.forEach((line, idx) => {
          if (idx > 0 && y > maxContentHeight) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin + labelWidth, y);
          y += 4.5;
        });
      }
      y += 2.5;
    }
    
    // 3. Experience Section
    const validExperience = (data.experience || []).filter(exp => 
      (exp.company && exp.company.trim()) || 
      (exp.role && exp.role.trim()) || 
      (exp.bullets && exp.bullets.trim())
    );
    if (validExperience.length > 0) {
      addSectionTitle("Experience");
      validExperience.forEach(exp => {
        if (y > maxContentHeight - 12) {
          doc.addPage();
          y = 20;
        }
        
        // Company Name & Dates
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(exp.company || 'Company Name', margin, y);
        
        if (exp.dates) {
          doc.setFont("times", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(exp.dates, rightMargin, y, { align: 'right' });
        }
        y += 4.2;
        
        // Role Title
        doc.setFont("times", "italic");
        doc.setTextColor(60, 60, 60);
        doc.text(exp.role || 'Role Title', margin, y);
        y += 5.2;
        
        // Bullets (Hanging Indent style)
        doc.setFont("times", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);
        
        const bullets = (exp.bullets || '').split('\n').filter(b => b.trim());
        bullets.forEach(bullet => {
          const cleanBullet = bullet.replace(/^-\s*/, '').replace(/^•\s*/, '').trim();
          if (!cleanBullet) return;
          
          if (y > maxContentHeight) {
            doc.addPage();
            y = 20;
          }
          
          const wrappedBullet = doc.splitTextToSize(cleanBullet, 172);
          doc.text("\u2022", margin + 3, y);
          
          wrappedBullet.forEach(line => {
            if (y > maxContentHeight) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, margin + 7, y);
            y += 4.2;
          });
          y += 0.8; // fine gap between bullets
        });
        y += 2.5;
      });
    }
    
    // 4. Projects Section
    const validProjects = (data.projects || []).filter(proj => 
      (proj.name && proj.name.trim()) || 
      (proj.tech && proj.tech.trim()) || 
      (proj.desc && proj.desc.trim())
    );
    if (validProjects.length > 0) {
      addSectionTitle("Projects");
      validProjects.forEach(proj => {
        if (y > maxContentHeight - 12) {
          doc.addPage();
          y = 20;
        }
        
        // Project Name
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(proj.name || 'Project Name', margin, y);
        const nameWidth = doc.getTextWidth(proj.name || 'Project Name');
        
        // Technologies on the same line with a separator
        if (proj.tech && proj.tech.trim()) {
          doc.setFont("times", "normal");
          doc.setTextColor(120, 120, 120);
          doc.text("   |   ", margin + nameWidth, y);
          const sepWidth = doc.getTextWidth("   |   ");
          
          doc.setFont("times", "italic");
          doc.setTextColor(80, 80, 80);
          const availableTechWidth = rightMargin - (margin + nameWidth + sepWidth);
          const wrappedTech = doc.splitTextToSize(proj.tech.trim(), availableTechWidth);
          doc.text(wrappedTech[0], margin + nameWidth + sepWidth, y);
        }
        y += 4.5;
        
        // Description Bullets
        doc.setFont("times", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);
        
        const bullets = (proj.desc || '').split('\n').filter(b => b.trim());
        bullets.forEach(bullet => {
          const cleanBullet = bullet.replace(/^-\s*/, '').replace(/^•\s*/, '').trim();
          if (!cleanBullet) return;
          
          if (y > maxContentHeight) {
            doc.addPage();
            y = 20;
          }
          
          const wrappedBullet = doc.splitTextToSize(cleanBullet, 172);
          doc.text("\u2022", margin + 3, y);
          
          wrappedBullet.forEach(line => {
            if (y > maxContentHeight) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, margin + 7, y);
            y += 4.2;
          });
          y += 0.8;
        });
        y += 2.5;
      });
    }
    
    // 5. Education Section (Optimized split GPA + degree dates)
    const validEducation = (data.education || []).filter(edu => 
      (edu.degree && edu.degree.trim()) || 
      (edu.school && edu.school.trim()) || 
      (edu.dates && edu.dates.trim())
    );
    if (validEducation.length > 0) {
      addSectionTitle("Education");
      validEducation.forEach(edu => {
        if (y > maxContentHeight - 12) {
          doc.addPage();
          y = 20;
        }
        
        // Degree title and potential GPA grade split
        const degreeParts = (edu.degree || '').split(" - ");
        const degreeTitle = degreeParts[0] || 'Degree/Major';
        const degreeGrade = degreeParts[1] || '';
        
        // Degree Name (Left) & Dates (Right)
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(degreeTitle, margin, y);
        
        if (edu.dates) {
          doc.setFont("times", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(edu.dates, rightMargin, y, { align: 'right' });
        }
        y += 4.2;
        
        // Institution (Left, Italic) & GPA Grade (Right, Bold)
        doc.setFont("times", "italic");
        doc.setTextColor(80, 80, 80);
        doc.text(edu.school || 'Institution', margin, y);
        
        if (degreeGrade) {
          doc.setFont("times", "bold");
          doc.setTextColor(40, 40, 40);
          doc.text(`Grade: ${degreeGrade}`, rightMargin, y, { align: 'right' });
        }
        y += 5.5;
      });
    }
    
    // 6. Certifications Section
    const validCertifications = (data.certifications || []).filter(c => c.name && c.name.trim());
    if (validCertifications.length > 0) {
      addSectionTitle("Awards & Certifications");
      
      validCertifications.forEach(cert => {
        if (y > maxContentHeight - 5) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("times", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);
        doc.text(`\u2022   ${cert.name.trim()}`, margin + 3, y);
        y += 4.5;
      });
      y += 2.5;
    }
    
    // 7. Hobbies Section
    if (data.hobbies && data.hobbies.trim()) {
      addSectionTitle("Hobbies");
      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      
      const wrappedHobbies = doc.splitTextToSize(data.hobbies.trim(), 180);
      wrappedHobbies.forEach(line => {
        if (y > maxContentHeight) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 4.5;
      });
    }
    
    // Post-process to render clean, subtle footer page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Subtle footer separator line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, 282, rightMargin, 282);
      
      // Footer labels
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.setFont("times", "normal");
      doc.text("CONFIDENTIAL | PROFESSIONAL RESUME", margin, 287);
      doc.text(`Page ${i} of ${pageCount}`, rightMargin, 287, { align: 'right' });
    }
    
    // Save PDF using formatted candidate name
    const formattedName = (data.name || 'Resume').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
    doc.save(`${formattedName}_Executive_Resume.pdf`);
  };

  // File Upload Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      alert('Only PDF files are supported!');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Only PDF files are supported!');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalyzeProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', session ? session.id : 'guest');
    
    // Simulate progression steps
    const timer = setInterval(() => {
      setAnalyzeProgress(prev => (prev < 80 ? prev + 15 : prev));
    }, 300);

    try {
      const res = await fetch(`${BACKEND_URL}/api/resume/analyze`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      clearInterval(timer);
      setAnalyzeProgress(100);
      
      if (!res.ok) {
        throw new Error(data.error || 'Resume analysis failed.');
      }
      
      setTimeout(() => {
        setAnalysisResult(data);
        setIsAnalyzing(false);
        setFile(null);
        fetchHistory();
      }, 500);

    } catch (err) {
      clearInterval(timer);
      setIsAnalyzing(false);
      alert(err.message);
    }
  };

  const handleExportPDF = () => {
    if (!analysisResult) return;
    
    const doc = new jsPDF();
    const result = analysisResult;
    
    // Set fonts
    doc.setFont("helvetica");
    
    // --- Header Banner ---
    doc.setFillColor(139, 92, 246); // Violet primary
    doc.rect(0, 0, 210, 15, "F");
    
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("AI RESUME EVALUATION & DEVOPS AUTOMATION PLATFORM", 15, 9.5);
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate 900
    doc.setFont("helvetica", "bold");
    doc.text("RESUME ASSESSMENT REPORT", 15, 30);
    
    // Line separator
    doc.setDrawColor(226, 232, 240); // slate 200
    doc.setLineWidth(0.5);
    doc.line(15, 34, 195, 34);
    
    // --- Candidate Info Grid ---
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // slate 500
    doc.setFont("helvetica", "bold");
    doc.text("CANDIDATE NAME:", 15, 41);
    doc.text("EMAIL ADDRESS:", 15, 47);
    doc.text("PHONE NUMBER:", 15, 53);
    
    doc.text("EVALUATION DATE:", 115, 41);
    doc.text("ATS SCORE RATIO:", 115, 47);
    doc.text("TOTAL WORD COUNT:", 115, 53);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42); // slate 900
    doc.text(result.name, 50, 41);
    doc.text(result.email, 50, 47);
    doc.text(result.phone, 50, 53);
    
    doc.text(new Date(result.uploadTime).toLocaleDateString(), 160, 41);
    
    // ATS Score text with specific color
    const score = result.atsScore;
    let scoreColor = [239, 68, 68]; // Red
    let scoreText = `${score}/100 (Needs Optimization)`;
    if (score >= 80) {
      scoreColor = [16, 185, 129]; // Green
      scoreText = `${score}/100 (Excellent)`;
    } else if (score >= 50) {
      scoreColor = [245, 158, 11]; // Orange
      scoreText = `${score}/100 (Fair)`;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(scoreText, 160, 47);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(String(result.totalWordCount), 160, 53);
    
    doc.line(15, 59, 195, 59);
    
    // --- Section 1: Career Recommendations ---
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Job Suitability & Recommendations", 15, 67);
    
    // Header row for Career matches table
    doc.setFontSize(9.5);
    doc.setFillColor(248, 250, 252); // slate 50
    doc.rect(15, 71, 180, 8, "F");
    
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Job Role", 18, 76.5);
    doc.text("Match Rate", 95, 76.5);
    doc.text("Matching Skills Extracted", 125, 76.5);
    
    doc.line(15, 79, 195, 79);
    
    doc.setFont("helvetica", "normal");
    let yOffset = 85;
    result.jobRecommendations.forEach((job) => {
      doc.setFont("helvetica", "bold");
      doc.text(job.role, 18, yOffset);
      
      doc.setTextColor(139, 92, 246);
      doc.text(`${job.matchPercentage}%`, 95, yOffset);
      
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      const skillsText = job.matchedSkills.length > 0 ? job.matchedSkills.join(", ") : "None";
      const truncatedSkills = skillsText.length > 35 ? skillsText.substring(0, 32) + "..." : skillsText;
      doc.text(truncatedSkills, 125, yOffset);
      
      doc.setTextColor(15, 23, 42);
      yOffset += 6.5;
    });
    
    doc.line(15, yOffset - 3, 195, yOffset - 3);
    yOffset += 4;
    
    // --- Section 2: Technical Skill Analysis ---
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Parsed Technical Skills Catalog", 15, yOffset);
    yOffset += 6;
    
    doc.setFontSize(9.5);
    Object.entries(result.detectedSkills).forEach(([category, skills]) => {
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 25;
      }
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(category + ":", 15, yOffset);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      const skillsText = skills.length > 0 ? skills.join(", ") : "No toolsets detected in this area.";
      
      const wrappedSkills = doc.splitTextToSize(skillsText, 140);
      doc.text(wrappedSkills, 50, yOffset);
      
      yOffset += (wrappedSkills.length * 5) + 1.5;
    });
    
    yOffset += 2;
    doc.line(15, yOffset - 3, 195, yOffset - 3);
    yOffset += 4;
    
    // --- Section 3: Strengths and Areas of Improvement ---
    if (yOffset > 220) {
      doc.addPage();
      yOffset = 25;
    }
    
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 128, 61); // Green 700
    doc.text(`Key Strengths of ${result.name}`, 15, yOffset);
    
    doc.setTextColor(185, 28, 28); // Red 700
    doc.text(`Improvement Areas for ${result.name}`, 108, yOffset);
    
    yOffset += 7;
    
    const strengths = result.strengths;
    const weaknesses = result.weaknesses;
    const maxLength = Math.max(strengths.length, weaknesses.length);
    
    doc.setFontSize(9);
    let strengthY = yOffset;
    let weaknessY = yOffset;
    
    for (let i = 0; i < maxLength; i++) {
      if (strengthY > 265 || weaknessY > 265) {
        doc.addPage();
        strengthY = 25;
        weaknessY = 25;
      }
      
      if (i < strengths.length) {
        doc.setTextColor(21, 128, 61);
        doc.text("[x]", 15, strengthY);
        doc.setTextColor(15, 23, 42);
        const wrappedStr = doc.splitTextToSize(strengths[i], 78);
        doc.text(wrappedStr, 21, strengthY);
        strengthY += (wrappedStr.length * 4.5) + 2.5;
      }
      
      if (i < weaknesses.length) {
        doc.setTextColor(185, 28, 28);
        doc.text("[!]", 108, weaknessY);
        doc.setTextColor(185, 28, 28); // Red for weaknesses
        const wrappedWeak = doc.splitTextToSize(weaknesses[i], 78);
        doc.text(wrappedWeak, 114, weaknessY);
        weaknessY += (wrappedWeak.length * 4.5) + 2.5;
      }
    }
    
    // --- Section 4: Tailored Mock Interview Questions ---
    if (result.interviewQuestions && result.interviewQuestions.length > 0) {
      doc.addPage();
      yOffset = 25;
      
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(139, 92, 246); // Primary violet
      doc.text("Tailored Mock Interview Questions", 15, yOffset);
      yOffset += 8;
      
      result.interviewQuestions.forEach((iq, idx) => {
        if (yOffset > 220) {
          doc.addPage();
          yOffset = 25;
        }
        
        // Render Question title & number
        doc.setFontSize(10.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42); // slate 900
        const qNumText = `Q${idx + 1}. `;
        doc.text(qNumText, 15, yOffset);
        
        // Render Question body
        doc.setFont("helvetica", "bold");
        const wrappedQ = doc.splitTextToSize(iq.question, 165);
        doc.text(wrappedQ, 22, yOffset);
        yOffset += (wrappedQ.length * 5) + 3;
        
        // Render Answer label
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129); // green status
        doc.text("Suggested Answer: ", 22, yOffset);
        
        // Render Answer body
        yOffset += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85); // slate 700
        const wrappedAnswerLines = doc.splitTextToSize(iq.answer, 165);
        doc.text(wrappedAnswerLines, 22, yOffset);
        
        yOffset += (wrappedAnswerLines.length * 4.5) + 8;
      });
    }
    
    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 282, 195, 282);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate 400
      doc.setFont("helvetica", "normal");
      doc.text("AI RESUME AUTOMATION PLATFORM - VERIFIED EVALUATION REPORT", 15, 287);
      doc.text(`Page ${i} of ${pageCount}`, 180, 287);
    }
    
    const formattedName = result.name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
    doc.save(`${formattedName}_Resume_Report.pdf`);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth screen if not logged in
  if (!session) {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-header">
            <h1>AI Resume DevOps</h1>
            <p>Automate resume parsing and container cloud deployments</p>
          </div>
          
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="John Doe" 
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />
            </div>

            {authError && <div style={{ color: 'var(--status-error)', fontSize: '13px' }}>{authError}</div>}
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              {isLogin ? 'Login to Dashboard' : 'Register Account'}
            </button>
          </form>
          
          <p className="auth-toggle" onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats for Dashboard widgets
  const avgAtsScore = historyList.length 
    ? Math.round(historyList.reduce((acc, curr) => acc + curr.atsScore, 0) / historyList.length) 
    : 0;

  // Flatten and count skills found in history
  const allSkillsHistory = historyList.flatMap(h => {
    return Object.values(h.detectedSkills || {}).flat();
  });
  const skillCounts = allSkillsHistory.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});
  const popularSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Score status categorization
  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="app-container">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">AI</div>
          <div className="logo-text">
            <h2>Resume Dev</h2>
            <p>DevOps Platform</p>
          </div>
        </div>

        <ul className="menu-list">
          <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'analyzer' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('analyzer')}>
              <FileText size={18} /> Resume Analyzer
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'jd_matcher' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('jd_matcher')}>
              <Search size={18} /> JD Matcher
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'interviewer' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('interviewer')}>
              <CloudLightning size={18} /> Interview Simulator
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'summary_generator' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('summary_generator')}>
              <TerminalIcon size={18} /> Summary Generator
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'resume_generator' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('resume_generator')}>
              <FileText size={18} /> AI Resume Builder
            </button>
          </li>
          <li className={`menu-item ${activeTab === 'devops' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('devops')}>
              <Server size={18} /> DevOps Panel
            </button>
          </li>

          <li className={`menu-item ${activeTab === 'history' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('history')}>
              <History size={18} /> Upload History
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {session.name ? session.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{session.name}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ justifyContent: 'flex-start', padding: '8px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="main-content">
        
        {/* --- HEADER BAR --- */}
        <div className="header-bar">
          <div className="page-title">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'analyzer' && 'AI Resume Analyzer'}
              {activeTab === 'jd_matcher' && 'Job Description Matcher'}
              {activeTab === 'interviewer' && 'Mock Interview Simulator'}
              {activeTab === 'summary_generator' && 'AI Resume Summary Generator'}
              {activeTab === 'resume_generator' && 'AI Resume Builder'}
              {activeTab === 'devops' && 'DevOps Control Panel'}
              {activeTab === 'history' && 'Resume Scan History'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Monitor recruitment metrics and live cloud deployment statuses.'}
              {activeTab === 'analyzer' && 'Upload candidate resumes to extract details and check ATS score matches.'}
              {activeTab === 'jd_matcher' && 'Evaluate resume relevance against specific job descriptions and create cover letters.'}
              {activeTab === 'interviewer' && 'Practice mock interview questions generated directly from candidate skills.'}
              {activeTab === 'summary_generator' && 'Generate customized professional summaries and elevator pitches matching target tones.'}
              {activeTab === 'resume_generator' && 'Create a corporate-ready, ATS-friendly professional resume for top companies.'}
              {activeTab === 'devops' && 'Configure CI/CD pipelines, track docker container builds, and deploy live on AWS EC2.'}
              {activeTab === 'history' && 'Access and download reports from previous resume parsing sessions.'}
            </p>
          </div>

          <div className="header-actions">
            <div className="btn-secondary btn" style={{ padding: '8px 14px', fontSize: '13px', cursor: 'default' }}>
              AI Engine: <span style={{ marginLeft: '6px', fontWeight: 'bold', color: flaskStatus === 'online' ? 'var(--status-success)' : 'var(--status-error)' }}>
                {flaskStatus === 'online' ? 'ONLINE (Port 5050)' : 'OFFLINE'}
              </span>
            </div>
            
            <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* --- CONTENT TABS --- */}
        
        {/* --- 1. DASHBOARD VIEW --- */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid-stats">
              <div className="card stat-card">
                <div className="stat-icon glow-violet">
                  <FileText size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{historyList.length}</div>
                  <div className="stat-label">Total Resumes</div>
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-icon glow-cyan">
                  <CloudLightning size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{avgAtsScore}%</div>
                  <div className="stat-label">Average ATS Score</div>
                </div>
              </div>

              <div className="card stat-card" onClick={() => setActiveTab('devops')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon glow-emerald">
                  <Server size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ textTransform: 'capitalize', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: devopsStatus.awsStatus === 'online' ? 'var(--status-success)' : 'var(--status-error)',
                      display: 'inline-block'
                    }} />
                    {devopsStatus.awsStatus === 'online' ? 'EC2 Online' : 'EC2 Offline'}
                  </div>
                  <div className="stat-label">Pipeline: {devopsStatus.pipelineStatus}</div>
                </div>
              </div>

              <div className="card stat-card" style={{ flexGrow: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '16px 20px', minWidth: '320px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Resume Summary Generator Modules</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)' }}>
                    <span style={{ color: 'var(--status-success)' }}>✅</span> <span>ATS Score Calculator</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)' }}>
                    <span style={{ color: 'var(--status-success)' }}>✅</span> <span>Career Recommendation</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)' }}>
                    <span style={{ color: 'var(--status-success)' }}>✅</span> <span>Skill Gap Analysis</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)' }}>
                    <span style={{ color: 'var(--status-success)' }}>✅</span> <span>AI Resume Summary</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)', gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--status-success)' }}>✅</span> <span>Interview Questions Generator</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Chart widget */}
              <div className="card">
                <h3 className="card-title">Live Server Resource Monitoring</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  Real-time CPU and RAM utilization percentages of the API gateway service.
                </p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="cpu" name="CPU Usage (%)" stroke="var(--color-secondary)" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="ram" name="RAM Usage (%)" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skills Cloud / Breakdown */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="card-title">Top Detected Skillsets</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  Aggregated technologies extracted from candidate submissions.
                </p>
                
                {popularSkills.length > 0 ? (
                  <div className="job-matches" style={{ flexGrow: 1, justifyContent: 'center' }}>
                    {popularSkills.map(([skill, count], idx) => {
                      const percentage = Math.round((count / historyList.length) * 100);
                      return (
                        <div className="job-item" key={skill}>
                          <div className="job-header">
                            <span>{skill}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{count} candidate{count > 1 ? 's' : ''} ({percentage}%)</span>
                          </div>
                          <div className="job-bar-bg">
                            <div 
                              className="job-bar-fill" 
                              style={{ 
                                width: `${percentage}%`,
                                background: idx % 2 === 0 ? 'linear-gradient(to right, #8b5cf6, #3b82f6)' : 'linear-gradient(to right, #06b6d4, #10b981)'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '12px', padding: '40px 0' }}>
                    <AlertTriangle size={32} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No resume data available yet.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Recent Resume Analysis Records</h3>
              {historyList.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Candidate Name</th>
                        <th>Filename</th>
                        <th>Upload Date</th>
                        <th>ATS Score</th>
                        <th>Primary Recommendation</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.slice(-5).reverse().map((record) => (
                        <tr key={record.id}>
                          <td style={{ fontWeight: '600' }}>{record.name}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{record.fileName}</td>
                          <td>{new Date(record.uploadTime).toLocaleDateString()}</td>
                          <td>
                            <span className={`score-badge ${getScoreClass(record.atsScore)}`}>
                              {record.atsScore}/100
                            </span>
                          </td>
                          <td>
                            {record.jobRecommendations[0] 
                              ? `${record.jobRecommendations[0].role} (${record.jobRecommendations[0].matchPercentage}%)`
                              : 'None'
                            }
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => {
                                  setAnalysisResult(record);
                                  setActiveTab('analyzer');
                                }}
                              >
                                View Detailed Report
                              </button>
                              <button 
                                className="btn-icon" 
                                style={{ width: '30px', height: '30px', color: 'var(--status-error)' }}
                                onClick={(e) => handleDeleteHistory(record.id, e)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlignment: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No history records found. Go to the Resume Analyzer tab to upload and parse.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 2. RESUME ANALYZER VIEW --- */}
        {activeTab === 'analyzer' && (
          <div>
            {!analysisResult ? (
              <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Analyze Candidate Resume</h2>
                
                {isAnalyzing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '30px 0' }}>
                    <div className="loader"></div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>Analyzing and matching skills...</div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${analyzeProgress}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Parsing file text and running NLP scanner</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div 
                      className={`upload-area ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload-input').click()}
                    >
                      <UploadCloud className="upload-icon" />
                      <div>
                        <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Click to upload</span> or drag and drop
                      </div>
                      <div className="upload-hint">Supported file format: PDF (Max 10MB)</div>
                      <input 
                        id="file-upload-input" 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileSelect} 
                        style={{ display: 'none' }} 
                      />
                    </div>

                    {file && (
                      <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <button className="btn btn-primary" onClick={handleAnalyze}>
                          Analyze Resume
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* --- RENDER ANALYSIS RESULT --- */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={() => setAnalysisResult(null)}>
                    ← Analyze Another Resume
                  </button>
                </div>

                {/* --- REPORT DOWNLOAD CENTER SECTION --- */}
                <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      📄
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>Report Download Center</h3>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                        Download a crisp, vector PDF report for <strong>{analysisResult.name}</strong> directly to your device.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" onClick={handleExportPDF}>
                      <Download size={16} /> Download PDF Report
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.print()}>
                      Print Preview
                    </button>
                  </div>
                </div>

                {/* --- AI GENERATED RESUME SUMMARY BLOCK --- */}
                {analysisResult.resumeSummary && (
                  <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                      ✨ AI Resume Summary (Elevator Pitch)
                    </h3>
                    <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                      {analysisResult.resumeSummary}
                    </p>
                    {analysisResult.resumeSummaryHighlights && analysisResult.resumeSummaryHighlights.length > 0 && (
                      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Career Highlights</span>
                        <ul className="points-list" style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                          {analysisResult.resumeSummaryHighlights.map((hl, idx) => (
                            <li className="point-item strength" key={idx} style={{ marginBottom: '4px' }}>
                              <span className="point-icon">✓</span>
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="analyzer-grid">
                  {/* Left Column: Stats & Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card score-card">
                      <div className="circle-score-wrapper">
                        <svg className="circle-score-svg">
                          <circle className="circle-bg" cx="75" cy="75" r="60" />
                          <circle 
                            className="circle-progress" 
                            cx="75" 
                            cy="75" 
                            r="60" 
                            stroke={
                              analysisResult.atsScore >= 80 ? 'var(--status-success)' :
                              analysisResult.atsScore >= 50 ? 'var(--status-warning)' : 'var(--status-error)'
                            }
                            strokeDasharray={2 * Math.PI * 60}
                            strokeDashoffset={2 * Math.PI * 60 * (1 - analysisResult.atsScore / 100)}
                          />
                        </svg>
                        <div className="circle-score-text">
                          <span className="score-num">{analysisResult.atsScore}</span>
                          <span className="score-lbl">ATS Match</span>
                        </div>
                      </div>
                      <h3>{analysisResult.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                        Email: {analysisResult.email} <br />
                        Phone: {analysisResult.phone}
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="card-title">Job Recommendations</h3>
                      <div className="job-matches">
                        {analysisResult.jobRecommendations.map((job) => (
                          <div className="job-item" key={job.role}>
                            <div className="job-header">
                              <span>{job.role}</span>
                              <span style={{ fontWeight: 'bold' }}>{job.matchPercentage}% Match</span>
                            </div>
                            <div className="job-bar-bg">
                              <div className="job-bar-fill" style={{ width: `${job.matchPercentage}%` }} />
                            </div>
                            {job.matchedSkills.length > 0 && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Matched: {job.matchedSkills.join(', ')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Skills & Strengths/Weaknesses */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card">
                      <h3 className="card-title">Parsed Skill Breakdown</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(analysisResult.detectedSkills).map(([category, skills]) => (
                          <div key={category}>
                            <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>{category}</h4>
                            {skills.length > 0 ? (
                              <div className="skills-flex">
                                {skills.map(skill => (
                                  <span className="skill-tag" key={skill}>{skill}</span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>None detected</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <h3 className="card-title" style={{ color: 'var(--status-success)' }}>
                          <CheckCircle size={18} /> Strengths of {analysisResult.name}
                        </h3>
                        <ul className="points-list">
                          {analysisResult.strengths.map((pt, idx) => (
                            <li className="point-item strength" key={idx}>
                              <span className="point-icon">✓</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="card-title" style={{ color: 'var(--status-error)' }}>
                          <XCircle size={18} /> Critical Improvement Areas for {analysisResult.name}
                        </h3>
                        {analysisResult.weaknesses.length > 0 ? (
                          <ul className="points-list">
                            {analysisResult.weaknesses.map((pt, idx) => (
                              <li className="point-item weakness" key={idx}>
                                <span className="point-icon">⚠</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>No critical areas of improvement found. Excellent resume structure!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- AI INTERVIEW PREPARATION CENTER --- */}
                {analysisResult.interviewQuestions && analysisResult.interviewQuestions.length > 0 && (
                  <div className="card" style={{ marginTop: '24px' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      🎙️ AI Interview Preparation Center
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                      Tailored technical questions and suggested answers compiled from the candidate's skills and experience.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {analysisResult.interviewQuestions.map((iq, idx) => (
                        <InterviewQuestionItem 
                          key={idx} 
                          question={iq.question} 
                          answer={iq.answer} 
                          index={idx + 1} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- JD MATCHER VIEW --- */}
        {activeTab === 'jd_matcher' && (
          <div>
            <div className="devops-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Left Column: Config Comparison inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                  <h3 className="card-title">
                    <Search size={18} /> Select Profile & Paste Job Details
                  </h3>
                  
                  <div className="form-group">
                    <label>Select parsed resume from database</label>
                    <select 
                      className="form-input" 
                      value={selectedResumeId}
                      onChange={(e) => {
                        setSelectedResumeId(e.target.value);
                        setJdMatchResult(null);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">-- Choose Candidate Resume --</option>
                      {historyList.map(h => (
                        <option key={h.id} value={h.id}>{h.name} ({h.fileName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Paste target Job Description (JD)</label>
                    <textarea 
                      className="form-input" 
                      rows="8" 
                      placeholder="Paste the key skills, roles, and requirements here..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      style={{ fontFamily: 'var(--font-body)', resize: 'vertical' }}
                    />
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '10px' }}
                    onClick={handleCompareJD}
                    disabled={isComparingJD || !selectedResumeId || !jdText.trim()}
                  >
                    {isComparingJD ? 'Comparing Resume and JD...' : 'Analyze JD Compatibility'}
                  </button>
                </div>
              </div>

              {/* Right Column: Match Result Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {jdMatchResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                      <div className="circle-score-wrapper" style={{ width: '110px', height: '110px', flexShrink: 0 }}>
                        <svg className="circle-score-svg" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                          <circle className="circle-bg" cx="55" cy="55" r="45" style={{ fill: 'none', stroke: 'var(--bg-tertiary)', strokeWidth: '8' }} />
                          <circle 
                            className="circle-progress" 
                            cx="55" 
                            cy="55" 
                            r="45" 
                            stroke={
                              jdMatchResult.matchPercentage >= 75 ? 'var(--status-success)' :
                              jdMatchResult.matchPercentage >= 50 ? 'var(--status-warning)' : 'var(--status-error)'
                            }
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - jdMatchResult.matchPercentage / 100)}
                            style={{ fill: 'none', strokeWidth: '8', strokeLinecap: 'round', transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                        </svg>
                        <div className="circle-score-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span className="score-num" style={{ fontSize: '28px', fontWeight: '800' }}>{jdMatchResult.matchPercentage}%</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Match</span>
                        </div>
                      </div>
                      <div>
                        <h3>JD Relevance Assessment</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                          {jdMatchResult.matchPercentage >= 75 ? 'Excellent match. The candidate possesses the key competencies requested.' :
                           jdMatchResult.matchPercentage >= 50 ? 'Moderate match. Recommended to review missing skill categories.' :
                           'Low relevance. The candidate is missing key technical components.'}
                        </p>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="card-title">Skill Gap Analysis</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <h4 style={{ color: 'var(--status-success)', fontSize: '13px', marginBottom: '10px' }}>✓ Matched Skillsets ({jdMatchResult.matchedSkills.length})</h4>
                          <div className="skills-flex">
                            {jdMatchResult.matchedSkills.length > 0 ? (
                              jdMatchResult.matchedSkills.map(s => <span className="skill-tag" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }} key={s}>{s}</span>)
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>None detected</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ color: 'var(--status-error)', fontSize: '13px', marginBottom: '10px' }}>⚠ Gaps Identified ({jdMatchResult.missingSkills.length})</h4>
                          <div className="skills-flex">
                            {jdMatchResult.missingSkills.length > 0 ? (
                              jdMatchResult.missingSkills.map(s => <span className="skill-tag" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--status-error)' }} key={s}>{s}</span>)
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>None detected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Tailored Cover Letter</span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => {
                            navigator.clipboard.writeText(jdMatchResult.coverLetter);
                            alert('Cover letter copied to clipboard!');
                          }}
                        >
                          Copy Text
                        </button>
                      </h3>
                      <pre 
                        style={{ 
                          whiteSpace: 'pre-wrap', 
                          fontFamily: 'var(--font-body)', 
                          fontSize: '13px', 
                          lineHeight: '1.6', 
                          color: 'var(--text-main)', 
                          maxHeight: '300px', 
                          overflowY: 'auto',
                          padding: '12px',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-glass)'
                        }}
                      >
                        {jdMatchResult.coverLetter}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Search size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p>Select a candidate and paste the target job description details to run the compatibility evaluator and generate a custom Cover Letter.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- INTERVIEW SIMULATOR VIEW --- */}
        {activeTab === 'interviewer' && (
          <div>
            <div className="devops-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              
              {/* Left Column: Question Selection & workspace */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                  <h3 className="card-title">Select Interview Question</h3>
                  <div className="form-group">
                    <label>Choose technical question from latest parsed resume</label>
                    <select 
                      className="form-input" 
                      value={selectedQuestion ? JSON.stringify(selectedQuestion) : ''}
                      onChange={(e) => {
                        setSelectedQuestion(e.target.value ? JSON.parse(e.target.value) : null);
                        setEvaluationResult(null);
                        setAnswerText('');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">-- Choose Question --</option>
                      {historyList.length > 0 && historyList[historyList.length - 1].interviewQuestions ? (
                        historyList[historyList.length - 1].interviewQuestions.map((q, idx) => (
                          <option key={idx} value={JSON.stringify(q)}>Q{idx + 1}: {q.question.substring(0, 75)}...</option>
                        ))
                      ) : (
                        <option value="" disabled>No candidate history records. Upload a resume first.</option>
                      )}
                    </select>
                  </div>

                  {selectedQuestion && (
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '8px', fontSize: '15px' }}>Active Question:</strong>
                      <span style={{ fontSize: '15px', fontWeight: '500' }}>{selectedQuestion.question}</span>
                    </div>
                  )}
                </div>

                {selectedQuestion && (
                  <div className="card">
                    <h3 className="card-title">Practice Workspace</h3>
                    <div className="form-group">
                      <label>Type your technical explanation below</label>
                      <textarea 
                        className="form-input" 
                        rows="8" 
                        placeholder="Define the concept, give examples, list advantages..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        style={{ fontFamily: 'var(--font-body)', resize: 'vertical' }}
                      />
                    </div>
                    
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: '10px' }}
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluatingAnswer || !answerText.trim()}
                    >
                      {isEvaluatingAnswer ? 'Evaluating Response...' : 'Submit Answer for AI Grading'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Feedback display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {evaluationResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                      <div className="circle-score-wrapper" style={{ width: '110px', height: '110px', flexShrink: 0 }}>
                        <svg className="circle-score-svg" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                          <circle className="circle-bg" cx="55" cy="55" r="45" style={{ fill: 'none', stroke: 'var(--bg-tertiary)', strokeWidth: '8' }} />
                          <circle 
                            className="circle-progress" 
                            cx="55" 
                            cy="55" 
                            r="45" 
                            stroke={
                              evaluationResult.score >= 80 ? 'var(--status-success)' :
                              evaluationResult.score >= 55 ? 'var(--status-warning)' : 'var(--status-error)'
                            }
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - evaluationResult.score / 100)}
                            style={{ fill: 'none', strokeWidth: '8', strokeLinecap: 'round', transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                        </svg>
                        <div className="circle-score-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span className="score-num" style={{ fontSize: '28px', fontWeight: '800' }}>{evaluationResult.score}</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</span>
                        </div>
                      </div>
                      <div>
                        <h3>AI Grade Sheet</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                          {evaluationResult.score >= 80 ? 'Excellent answer! You demonstrated complete conceptual clarity and technical depth.' :
                           evaluationResult.score >= 55 ? 'Good start, but missing key details to make it a fully structured answer.' :
                           'Conceptual gaps identified. Try adding more concrete keywords or structural definitions.'}
                        </p>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="card-title" style={{ color: 'var(--status-error)' }}>
                        <XCircle size={18} style={{ color: 'var(--status-error)' }} /> Critique / Gaps Identified
                      </h3>
                      <ul className="points-list">
                        {evaluationResult.critique.map((crit, idx) => (
                          <li className="point-item weakness" key={idx}>
                            <span className="point-icon">⚠</span>
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card">
                      <h3 className="card-title" style={{ color: 'var(--status-success)' }}>
                        <CheckCircle size={18} style={{ color: 'var(--status-success)' }} /> How to Improve
                      </h3>
                      <ul className="points-list">
                        {evaluationResult.suggestions.map((sug, idx) => (
                          <li className="point-item strength" key={idx}>
                            <span className="point-icon">✓</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CloudLightning size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p>Select a mock interview question from the dropdown and type your explanation in the workspace to get an instantaneous AI grading card.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- SUMMARY GENERATOR VIEW --- */}
        {activeTab === 'summary_generator' && (
          <div>
            <div className="devops-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
              
              {/* Left Column: Configuration Cockpit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                  <h3 className="card-title">
                    <TerminalIcon size={18} /> Configuration Cockpit
                  </h3>
                  
                  <div className="form-group">
                    <label>Select Candidate Profile</label>
                    <select 
                      className="form-input" 
                      value={selectedResumeIdForSummary}
                      onChange={(e) => {
                        setSelectedResumeIdForSummary(e.target.value);
                        setSummaryResult(null);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">-- Choose Candidate Resume --</option>
                      {historyList.map(h => (
                        <option key={h.id} value={h.id}>{h.name} ({h.fileName})</option>
                      ))}
                    </select>
                  </div>

                  {/* Tone Selector */}
                  <div className="form-group">
                    <label>Summary Tone</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['professional', 'technical', 'executive', 'creative'].map(tone => (
                        <button
                          key={tone}
                          type="button"
                          className="btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: summaryTone === tone ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                            color: summaryTone === tone ? 'white' : 'var(--text-main)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '20px',
                            textTransform: 'capitalize'
                          }}
                          onClick={() => setSummaryTone(tone)}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length Selector */}
                  <div className="form-group">
                    <label>Profile Length</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['concise', 'balanced', 'detailed'].map(len => (
                        <button
                          key={len}
                          type="button"
                          className="btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: summaryLength === len ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                            color: summaryLength === len ? 'white' : 'var(--text-main)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '20px',
                            textTransform: 'capitalize'
                          }}
                          onClick={() => setSummaryLength(len)}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Focus Selector */}
                  <div className="form-group">
                    <label>Technical Focus Area</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['general', 'Frontend', 'Backend', 'DevOps'].map(foc => (
                        <button
                          key={foc}
                          type="button"
                          className="btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: summaryFocus === foc ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                            color: summaryFocus === foc ? 'white' : 'var(--text-main)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '20px',
                            textTransform: foc === 'general' ? 'capitalize' : 'none'
                          }}
                          onClick={() => setSummaryFocus(foc)}
                        >
                          {foc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary || !selectedResumeIdForSummary}
                  >
                    {isGeneratingSummary ? 'Generating Custom Summary...' : 'Generate AI Summary'}
                  </button>
                </div>
              </div>

              {/* Right Column: Results panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {summaryResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card">
                      <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>✨ Generated AI Resume Summary</span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => {
                            navigator.clipboard.writeText(summaryResult.summary);
                            alert('Summary copied to clipboard!');
                          }}
                        >
                          Copy Summary
                        </button>
                      </h3>
                      <p 
                        style={{ 
                          fontSize: '14.5px', 
                          lineHeight: '1.6', 
                          color: 'var(--text-main)',
                          padding: '16px',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-glass)',
                          margin: 0
                        }}
                      >
                        {summaryResult.summary}
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="card-title">🚀 Professional Highlight Bullets</h3>
                      <ul className="points-list" style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                        {summaryResult.highlights.map((hl, idx) => (
                          <li className="point-item strength" key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <span className="point-icon">✓</span>
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <TerminalIcon size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p>Select a candidate profile and configure your desired tone, length, and technical focus parameters to generate a custom elevator pitch and professional highlight points.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- RESUME GENERATOR VIEW --- */}
        {activeTab === 'resume_generator' && (
          <div>
            <div className="devops-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              
              {/* Left Column: Input Form Workspace */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                  
                  {/* Prefill Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)', gap: '16px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Resume Workspace</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        className="form-input"
                        value={selectedResumeIdForBuilder}
                        onChange={(e) => setSelectedResumeIdForBuilder(e.target.value)}
                        style={{ padding: '6px 12px', fontSize: '12.5px', width: '220px', height: '32px', cursor: 'pointer' }}
                      >
                        <option value="">-- Load Parsed Profile --</option>
                        {historyList.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0 12px', fontSize: '12px', height: '32px' }}
                        onClick={() => handlePrefillResumeBuilder(selectedResumeIdForBuilder)}
                        disabled={!selectedResumeIdForBuilder}
                      >
                        Pre-fill Form
                      </button>
                    </div>
                  </div>

                  {/* Form Section Navigation */}
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
                    {[
                      { id: 'personal', label: 'Bio & Contact' },
                      { id: 'experience', label: 'Experience' },
                      { id: 'education', label: 'Education' },
                      { id: 'projects', label: 'Projects' },
                      { id: 'skills', label: 'Skills' },
                      { id: 'certificates', label: 'Certificates' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        className="btn"
                        style={{
                          padding: '6px 14px',
                          fontSize: '13px',
                          backgroundColor: builderTab === tab.id ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                          color: builderTab === tab.id ? 'white' : 'var(--text-main)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => setBuilderTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Form Views */}
                  {builderTab === 'personal' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Full Name</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={builderResumeData.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBuilderResumeData(prev => ({ ...prev, name: val }));
                            }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Job Title</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Senior DevOps Engineer"
                            value={builderResumeData.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBuilderResumeData(prev => ({ ...prev, title: val }));
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Email Address</label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="johndoe@example.com"
                            value={builderResumeData.email}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBuilderResumeData(prev => ({ ...prev, email: val }));
                            }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Phone Number</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="+1 555 123 4567"
                            value={builderResumeData.phone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBuilderResumeData(prev => ({ ...prev, phone: val }));
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Location (City, Country)</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="San Francisco, USA"
                            value={builderResumeData.location}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBuilderResumeData(prev => ({ ...prev, location: val }));
                            }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Website / LinkedIn / GitHub</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="github.com/johndoe"
                            value={builderResumeData.website}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBuilderResumeData(prev => ({ ...prev, website: val }));
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Professional Profile Summary</label>
                        <textarea
                          className="form-input"
                          rows="5"
                          placeholder="Write a brief professional summary of your experience..."
                          value={builderResumeData.summary}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, summary: val }));
                          }}
                          style={{ fontFamily: 'var(--font-body)', resize: 'vertical' }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            marginTop: '10px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px dashed var(--color-primary)',
                            color: 'var(--color-primary)'
                          }}
                          onClick={handleAIParseSummary}
                          disabled={isParsingSummary}
                        >
                          {isParsingSummary ? 'AI Extractor Parsing & Distributing...' : '✨ AI Parse & Distribute Summary Elements'}
                        </button>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Hobbies / Extracurriculars (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Reading, Chess, Coding"
                          value={builderResumeData.hobbies || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, hobbies: val }));
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {builderTab === 'experience' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {builderResumeData.experience.map((exp, index) => (
                        <div key={exp.id} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--color-primary)' }}>Position #{index + 1}</strong>
                            {builderResumeData.experience.length > 1 && (
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                onClick={() => {
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    experience: prev.experience.filter(e => e.id !== exp.id)
                                  }));
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Company Name</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Google"
                                value={exp.company}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    experience: prev.experience.map(el => el.id === exp.id ? { ...el, company: val } : el)
                                  }));
                                }}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Job Title / Role</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Senior Engineer"
                                value={exp.role}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    experience: prev.experience.map(el => el.id === exp.id ? { ...el, role: val } : el)
                                  }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label>Duration / Dates (e.g. June 2022 - Present)</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="2022 - Present"
                              value={exp.dates}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBuilderResumeData(prev => ({
                                  ...prev,
                                  experience: prev.experience.map(el => el.id === exp.id ? { ...el, dates: val } : el)
                                }));
                              }}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Bullet Points / Achievements (One per line)</label>
                            <textarea
                              className="form-input"
                              rows="4"
                              placeholder="- Achieved 99.9% uptime by containerizing tasks&#10;- Led a team of four junior engineers"
                              value={exp.bullets}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBuilderResumeData(prev => ({
                                  ...prev,
                                  experience: prev.experience.map(el => el.id === exp.id ? { ...el, bullets: val } : el)
                                }));
                              }}
                              style={{ fontFamily: 'var(--font-body)', resize: 'vertical' }}
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={() => {
                          setBuilderResumeData(prev => ({
                            ...prev,
                            experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', dates: '', bullets: '' }]
                          }));
                        }}
                      >
                        + Add Work Experience
                      </button>
                    </div>
                  )}

                  {builderTab === 'education' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {builderResumeData.education.map((edu, index) => (
                        <div key={edu.id} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--color-primary)' }}>Education #{index + 1}</strong>
                            {builderResumeData.education.length > 1 && (
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                onClick={() => {
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    education: prev.education.filter(e => e.id !== edu.id)
                                  }));
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Degree / Major</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="B.E. in Computer Science"
                                value={edu.degree}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    education: prev.education.map(el => el.id === edu.id ? { ...el, degree: val } : el)
                                  }));
                                }}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>School / University Name</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="VTU University"
                                value={edu.school}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    education: prev.education.map(el => el.id === edu.id ? { ...el, school: val } : el)
                                  }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Graduation Year / Dates</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="2021 - 2025"
                              value={edu.dates}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBuilderResumeData(prev => ({
                                  ...prev,
                                  education: prev.education.map(el => el.id === edu.id ? { ...el, dates: val } : el)
                                }));
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={() => {
                          setBuilderResumeData(prev => ({
                            ...prev,
                            education: [...prev.education, { id: Date.now().toString(), degree: '', school: '', dates: '' }]
                          }));
                        }}
                      >
                        + Add Education Section
                      </button>
                    </div>
                  )}

                  {builderTab === 'projects' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {builderResumeData.projects.map((proj, index) => (
                        <div key={proj.id} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--color-primary)' }}>Project #{index + 1}</strong>
                            {builderResumeData.projects.length > 1 && (
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                onClick={() => {
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    projects: prev.projects.filter(p => p.id !== proj.id)
                                  }));
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Project Name</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="E-Commerce API"
                                value={proj.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    projects: prev.projects.map(el => el.id === proj.id ? { ...el, name: val } : el)
                                  }));
                                }}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Technologies Used</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="React, Node.js, Docker"
                                value={proj.tech}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBuilderResumeData(prev => ({
                                    ...prev,
                                    projects: prev.projects.map(el => el.id === proj.id ? { ...el, tech: val } : el)
                                  }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Project Description / Details (One per line)</label>
                            <textarea
                              className="form-input"
                              rows="3"
                              placeholder="- Implemented full-stack features&#10;- Containerized database using SQLite"
                              value={proj.desc}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBuilderResumeData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(el => el.id === proj.id ? { ...el, desc: val } : el)
                                }));
                              }}
                              style={{ fontFamily: 'var(--font-body)', resize: 'vertical' }}
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={() => {
                          setBuilderResumeData(prev => ({
                            ...prev,
                            projects: [...prev.projects, { id: Date.now().toString(), name: '', tech: '', desc: '' }]
                          }));
                        }}
                      >
                        + Add Project Section
                      </button>
                    </div>
                  )}

                  {builderTab === 'skills' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Frontend Skills (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="React, HTML5, CSS3, JavaScript"
                          value={builderResumeData.skills.frontend}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, skills: { ...prev.skills, frontend: val } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Backend Skills (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Node.js, Express, Python, Flask"
                          value={builderResumeData.skills.backend}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, skills: { ...prev.skills, backend: val } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Programming Skills (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="C, Java, C++, POCD, DMS"
                          value={builderResumeData.skills.programming || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, skills: { ...prev.skills, programming: val } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Database Skills (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="PostgreSQL, MongoDB, SQL"
                          value={builderResumeData.skills.database}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, skills: { ...prev.skills, database: val } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>DevOps Skills (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Docker, Kubernetes, Jenkins, Git"
                          value={builderResumeData.skills.devops}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, skills: { ...prev.skills, devops: val } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Cloud Skills (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="AWS, GCP, Azure"
                          value={builderResumeData.skills.cloud}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, skills: { ...prev.skills, cloud: val } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Soft Skills (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Communication, Leadership, Teamwork"
                          value={builderResumeData.softSkills || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBuilderResumeData(prev => ({ ...prev, softSkills: val }));
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {builderTab === 'certificates' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {builderResumeData.certifications.map((cert, index) => (
                        <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="form-group" style={{ marginBottom: 0, flexGrow: 1 }}>
                            <label>Certificate Name / Detail #{index + 1}</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="AWS Certified Solutions Architect"
                              value={cert.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBuilderResumeData(prev => ({
                                  ...prev,
                                  certifications: prev.certifications.map(c => c.id === cert.id ? { ...c, name: val } : c)
                                }));
                              }}
                            />
                          </div>
                          {builderResumeData.certifications.length > 1 && (
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ width: '36px', height: '36px', marginTop: '20px', color: 'var(--status-error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => {
                                setBuilderResumeData(prev => ({
                                  ...prev,
                                  certifications: prev.certifications.filter(c => c.id !== cert.id)
                                }));
                              }}
                              title="Remove Certificate"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={() => {
                          setBuilderResumeData(prev => ({
                            ...prev,
                            certifications: [...prev.certifications, { id: Date.now().toString(), name: '' }]
                          }));
                        }}
                      >
                        + Add Certificate
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Column: Live Data Preview Sheet */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 className="card-title">Document Exporter</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                    Compile and build your corporate-standard PDF. The document structure enforces correct margins and ATS layouts.
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={handleExportBuilderResumePDF}
                    disabled={!builderResumeData.name.trim()}
                  >
                    <Download size={16} /> Export Corporate Resume PDF
                  </button>
                </div>

                <div className="card" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="card-title" style={{ marginBottom: '12px' }}>Live Summary Sheet</h3>
                  
                  <div style={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    padding: '20px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13.5px',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    maxHeight: '450px'
                  }}>
                    {/* Header preview */}
                    <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                      <strong style={{ fontSize: '18px', color: 'var(--color-primary)', display: 'block' }}>{builderResumeData.name || 'CANDIDATE NAME'}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{builderResumeData.title || 'Job Title'}</span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {[builderResumeData.email, builderResumeData.phone, builderResumeData.location].filter(Boolean).join('  |  ')}
                      </div>
                    </div>

                    {/* Summary preview */}
                    {builderResumeData.summary && (
                      <div>
                        <strong style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Summary</strong>
                        <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.5' }}>{builderResumeData.summary}</p>
                      </div>
                    )}

                    {/* Experience preview */}
                    {builderResumeData.experience.some(e => e.company || e.role) && (
                      <div>
                        <strong style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Work Experience</strong>
                        {builderResumeData.experience.map(exp => (exp.company || exp.role) && (
                          <div key={exp.id} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
                              <span>{exp.company}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{exp.dates}</span>
                            </div>
                            <div style={{ fontStyle: 'italic', fontSize: '11.5px', color: 'var(--text-muted)' }}>{exp.role}</div>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '11.5px', marginTop: '4px', paddingLeft: '8px' }}>{exp.bullets}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills preview */}
                    {(Object.values(builderResumeData.skills).some(Boolean) || builderResumeData.softSkills) && (
                      <div>
                        <strong style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Key Skills</strong>
                        <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {Object.entries(builderResumeData.skills).map(([category, skills]) => skills && skills.trim() && (
                            <div key={category}>
                              <strong style={{ textTransform: 'capitalize' }}>{category === 'programming' ? 'programming skills' : category}:</strong> {skills}
                            </div>
                          ))}
                          {builderResumeData.softSkills && builderResumeData.softSkills.trim() && (
                            <div>
                              <strong>Soft Skills:</strong> {builderResumeData.softSkills}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Projects preview */}
                    {builderResumeData.projects.some(p => p.name) && (
                      <div>
                        <strong style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Projects</strong>
                        {builderResumeData.projects.map(proj => proj.name && (
                          <div key={proj.id} style={{ marginBottom: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                              {proj.name} {proj.tech && <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '11px' }}>[{proj.tech}]</span>}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '11.5px', marginTop: '2px', paddingLeft: '8px' }}>{proj.desc}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education preview */}
                    {builderResumeData.education.some(e => e.degree || e.school) && (
                      <div>
                        <strong style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Education</strong>
                        {builderResumeData.education.map(edu => (edu.degree || edu.school) && (
                          <div key={edu.id} style={{ marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
                              <span>{edu.degree}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{edu.dates}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{edu.school}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Certifications preview */}
                    {builderResumeData.certifications.some(c => c.name) && (
                      <div>
                        <strong style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Certifications</strong>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px' }}>
                          {builderResumeData.certifications.map(cert => cert.name && (
                            <li key={cert.id}>{cert.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hobbies preview */}
                    {builderResumeData.hobbies && builderResumeData.hobbies.trim() && (
                      <div>
                        <strong style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Hobbies</strong>
                        <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.5' }}>{builderResumeData.hobbies}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- 4. HISTORY VIEW --- */}
        {activeTab === 'history' && (
          <div className="card">
            <h3 className="card-title">Resume Scanning History</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Full database of previous resumes evaluated under this account.
            </p>
            {historyList.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Filename</th>
                      <th>Analysis Date</th>
                      <th>Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList.map((record) => (
                      <tr key={record.id}>
                        <td style={{ fontWeight: '600' }}>{record.name}</td>
                        <td>{record.email}</td>
                        <td>{record.phone}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{record.fileName}</td>
                        <td>{new Date(record.uploadTime).toLocaleString()}</td>
                        <td>
                          <span className={`score-badge ${getScoreClass(record.atsScore)}`}>
                            {record.atsScore}/100
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => {
                                setAnalysisResult(record);
                                setActiveTab('analyzer');
                              }}
                            >
                              Load Report
                            </button>
                            <button 
                              className="btn-icon" 
                              style={{ width: '30px', height: '30px', color: 'var(--status-error)' }}
                              onClick={(e) => handleDeleteHistory(record.id, e)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlignment: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No parsing records found in your database.
              </div>
            )}
          </div>
        )}

        {/* --- 5. DEVOPS PANEL VIEW --- */}
        {activeTab === 'devops' && (
          <div className="devops-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
            {/* Left Column: Configuration & Status Monitoring */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings2 size={18} /> CI/CD Target Configuration
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  Specify the target repos, servers, and build settings for automated container delivery.
                </p>
                <form onSubmit={handleSaveDevOpsConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>GitHub Repository URL</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editedGithubRepo} 
                      onChange={(e) => setEditedGithubRepo(e.target.value)}
                      placeholder="https://github.com/..." 
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Jenkins Server URL</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editedJenkinsUrl} 
                      onChange={(e) => setEditedJenkinsUrl(e.target.value)}
                      placeholder="http://jenkins-server:8080" 
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Docker Hub Image Tag Prefix</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editedDockerImage} 
                      onChange={(e) => setEditedDockerImage(e.target.value)}
                      placeholder="username/image-name" 
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>AWS EC2 Target Instance IP</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editedAwsHost} 
                      onChange={(e) => setEditedAwsHost(e.target.value)}
                      placeholder="54.210.12.34" 
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', margin: '6px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Simulation Execution Mode</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mock Ansible & Docker stages for local presentation</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={editedSimulationMode} 
                      onChange={(e) => setEditedSimulationMode(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
                    Save Pipeline Settings
                  </button>
                </form>
              </div>

              {/* EC2 Live Container Monitoring */}
              <div className="card">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={18} /> AWS EC2 Active Containers
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '14px' }}>
                  Active Docker container instances on host: <strong>{devopsStatus.awsHost || 'None'}</strong>
                </p>
                {devopsStatus.dockerContainers && devopsStatus.dockerContainers.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="containers-table">
                      <thead>
                        <tr>
                          <th>Container Name</th>
                          <th>Port Map</th>
                          <th>Uptime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devopsStatus.dockerContainers.map((container, idx) => (
                          <tr key={idx}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold' }}>{container.name}</td>
                            <td style={{ fontSize: '12px', color: 'var(--color-primary)' }}>{container.port}</td>
                            <td>
                              <span className="status-badge status-online">
                                {container.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 10px', gap: '8px', border: '1px dashed var(--border-glass)', borderRadius: '6px' }}>
                    <AlertTriangle size={24} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No containers detected. Trigger a pipeline build to pull and launch docker containers.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: CI/CD Pipeline & Streaming Terminal Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 className="card-title">CI/CD Execution Status</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                      Orchestrate pipeline stages, compile services, build Docker images, and configure EC2 via Ansible.
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    disabled={devopsStatus.pipelineStatus === 'running'}
                    onClick={handleTriggerDeploy}
                    style={{ gap: '8px', display: 'flex', alignItems: 'center' }}
                  >
                    <Play size={14} /> Trigger EC2 Deploy
                  </button>
                </div>

                {/* Pipeline visual diagram */}
                <div className="pipeline-visual">
                  {/* Step 1: GitHub */}
                  <div className={`pipeline-node ${devopsStatus.pipelineStatus === 'running' && devopsStatus.pipelineProgress >= 10 && devopsStatus.pipelineProgress < 30 ? 'active' : ''} ${devopsStatus.pipelineProgress >= 30 ? 'success' : ''}`}>
                    <div className="node-icon">
                      <GitBranch size={20} />
                    </div>
                    <span className="node-label">Checkout GitHub</span>
                  </div>
                  <div className={`pipeline-connector ${devopsStatus.pipelineProgress >= 30 ? 'success' : ''}`} />

                  {/* Step 2: Jenkins */}
                  <div className={`pipeline-node ${devopsStatus.pipelineStatus === 'running' && devopsStatus.pipelineProgress >= 30 && devopsStatus.pipelineProgress < 60 ? 'active' : ''} ${devopsStatus.pipelineProgress >= 60 ? 'success' : ''}`}>
                    <div className="node-icon">
                      <Settings2 size={20} />
                    </div>
                    <span className="node-label">Jenkins Build/Test</span>
                  </div>
                  <div className={`pipeline-connector ${devopsStatus.pipelineProgress >= 60 ? 'success' : ''}`} />

                  {/* Step 3: Docker */}
                  <div className={`pipeline-node ${devopsStatus.pipelineStatus === 'running' && devopsStatus.pipelineProgress >= 60 && devopsStatus.pipelineProgress < 85 ? 'active' : ''} ${devopsStatus.pipelineProgress >= 85 ? 'success' : ''}`}>
                    <div className="node-icon">
                      <FileText size={20} />
                    </div>
                    <span className="node-label">Docker Packaging</span>
                  </div>
                  <div className={`pipeline-connector ${devopsStatus.pipelineProgress >= 85 ? 'success' : ''}`} />

                  {/* Step 4: Ansible */}
                  <div className={`pipeline-node ${devopsStatus.pipelineStatus === 'running' && devopsStatus.pipelineProgress >= 85 && devopsStatus.pipelineProgress < 100 ? 'active' : ''} ${devopsStatus.pipelineProgress >= 100 ? 'success' : ''}`}>
                    <div className="node-icon">
                      <Server size={20} />
                    </div>
                    <span className="node-label">Ansible Playbook</span>
                  </div>
                  <div className={`pipeline-connector ${devopsStatus.pipelineProgress >= 100 ? 'success' : ''}`} />

                  {/* Step 5: Smoke Test */}
                  <div className={`pipeline-node ${devopsStatus.pipelineStatus === 'running' && devopsStatus.pipelineProgress >= 100 ? 'active' : ''} ${devopsStatus.pipelineStatus === 'success' ? 'success' : ''}`}>
                    <div className="node-icon">
                      <CheckCircle size={20} />
                    </div>
                    <span className="node-label">AWS Validation</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${devopsStatus.pipelineProgress}%`, 
                      height: '100%', 
                      background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 'bold', minWidth: '35px', textAlign: 'right' }}>{devopsStatus.pipelineProgress}%</span>
                </div>
              </div>

              {/* Streaming Logs Terminal */}
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <span className="terminal-title">bash --session=pipeline_logs.sh</span>
                  <button 
                    onClick={handleClearLogs} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                  >
                    [Clear Logs]
                  </button>
                </div>
                <div className="terminal-body">
                  {devopsLogs && devopsLogs.length > 0 ? (
                    devopsLogs.map((logLine, idx) => (
                      <div key={idx} className="terminal-line" style={{ 
                        color: logLine.startsWith('✔') || logLine.includes('SUCCESS') ? 'var(--status-success)' :
                               logLine.startsWith('🚀') || logLine.includes('Starting') ? 'var(--color-secondary)' :
                               logLine.startsWith('[Jenkins]') ? '#a78bfa' :
                               logLine.includes('changed:') || logLine.includes('TASK [') ? 'var(--status-warning)' :
                               logLine.includes('failed=') || logLine.startsWith('Error') ? 'var(--status-error)' : '#38bdf8'
                      }}>
                        {logLine}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                      Terminal idle. Click "Trigger EC2 Deploy" to start logs stream...
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
