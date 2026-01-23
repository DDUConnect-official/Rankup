import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RankUpLogo from '../assets/RankUp_Logo.png';
import { Plus, Save, Trash2, Book, Gamepad, HelpCircle, CheckCircle, Circle, X, Menu, Pencil } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ modules: 0, levels: 0, students: 0, status: 'Online' });
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [levels, setLevels] = useState([]);
  const [activeLevel, setActiveLevel] = useState(null); // 'new' or levelId
  const [loading, setLoading] = useState(true);
  const [showModules, setShowModules] = useState(false);
  const [users, setUsers] = useState([]);
  const [viewMode, setViewMode] = useState('modules'); // 'modules' or 'users'

  const [levelForm, setLevelForm] = useState({
    title: '', description: '', xpReward: 50, hasGame: false, hasQuiz: false, isPublished: false,
    content: ['']  // Simple array of paragraph strings
  });

  const [quizForm, setQuizForm] = useState({
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }], passingScore: 70
  });

  const [gameForm, setGameForm] = useState({
    name: '', type: 'logic', difficulty: 'easy', instructions: '', xpReward: 50
  });

  const [formTab, setFormTab] = useState('theory');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const loadContent = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/modules`, { headers: { email: user.email } });
      setModules(resp.data);
      if (resp.data.length > 0) setSelectedModule(resp.data[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`, { headers: { email: user.email } });
      setStats(resp.data);
    } catch (err) { console.error(err); }
  };

  const loadLevels = async () => {
    if (!selectedModule) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/levels/${selectedModule._id}`, { headers: { email: user.email } });
      setLevels(res.data);
      setStats(s => ({ ...s, levels: res.data.length }));
    } catch (err) { console.error(err); }
  };

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, { headers: { email: user.email } });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadContent(); loadStats(); }, []);
  useEffect(() => { if (viewMode === 'users') loadUsers(); }, [viewMode]);
  useEffect(() => { loadLevels(); }, [selectedModule]);

  const saveLevel = async () => {
    try {
      let levelId;
      if (activeLevel === 'new') {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/level`, { ...levelForm, moduleId: selectedModule._id }, { headers: { email: user.email } });
        levelId = res.data._id;
      } else {
        const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/level/${activeLevel}`, { ...levelForm }, { headers: { email: user.email } });
        levelId = activeLevel;
      }

      if (levelForm.hasQuiz) {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/quiz`, { ...quizForm, levelId }, { headers: { email: user.email } });
      } else if (activeLevel !== 'new') {
        // If editing and hasQuiz is false, try to delete existing quiz
        try {
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/quiz/${levelId}`, { headers: { email: user.email } });
        } catch (e) { console.log('No quiz to delete or error'); }
      }

      if (levelForm.hasGame) await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/game`, { ...gameForm, levelId }, { headers: { email: user.email } });

      setActiveLevel(null); resetFields(); loadLevels();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const deleteLevel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this level?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/level/${id}`, { headers: { email: user.email } });
      loadLevels();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const editLevel = async (level) => {
    setActiveLevel(level._id);
    setLevelForm({
      title: level.title,
      description: level.description,
      xpReward: level.xpReward,
      hasGame: level.hasGame,
      hasQuiz: level.hasQuiz,
      isPublished: level.isPublished,
      content: level.content || ['']  // Simple array of strings
    });
    // Fetch quiz
    setQuizForm({ questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }], passingScore: 70 });
    if (level.hasQuiz) {
      try {
        const qRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/quiz/${level._id}`, { headers: { email: user.email } });
        if (qRes.data) setQuizForm(qRes.data);
      } catch (e) { console.log("No quiz found"); }
    }
    // Fetch game
    setGameForm({ name: '', type: 'logic', difficulty: 'easy', instructions: '', xpReward: 50 });
    if (level.hasGame) {
      try {
        const gRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/game/${level._id}`, { headers: { email: user.email } });
        if (gRes.data) setGameForm(gRes.data);
      } catch (e) { console.log("No game found"); }
    }
  };

  const togglePublish = async (levelId, currentStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/level/${levelId}`, { isPublished: !currentStatus }, { headers: { email: user.email } });
      loadLevels();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const resetFields = () => {
    setLevelForm({ title: '', description: '', xpReward: 50, hasGame: false, hasQuiz: false, isPublished: false, content: [''] });  // Simple array
    setQuizForm({ questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }], passingScore: 70 });
    setGameForm({ name: '', type: 'logic', difficulty: 'easy', instructions: '', xpReward: 50 });
    setFormTab('theory');
  };

  const addParagraph = () => setLevelForm({ ...levelForm, content: [...levelForm.content, ''] });
  const updateParagraph = (idx, value) => { const n = [...levelForm.content]; n[idx] = value; setLevelForm({ ...levelForm, content: n }); };
  const removeParagraph = (idx) => setLevelForm({ ...levelForm, content: levelForm.content.filter((_, i) => i !== idx) });
  const addQuestion = () => setQuizForm({ ...quizForm, questions: [...quizForm.questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }] });
  const updateQuestion = (qIdx, field, value) => { const n = [...quizForm.questions]; n[qIdx][field] = value; setQuizForm({ ...quizForm, questions: n }); };
  const updateOption = (qIdx, oIdx, value) => { const n = [...quizForm.questions]; n[qIdx].options[oIdx] = value; setQuizForm({ ...quizForm, questions: n }); };
  const setCorrectAnswer = (qIdx, answer) => { const n = [...quizForm.questions]; n[qIdx].correctAnswer = answer; setQuizForm({ ...quizForm, questions: n }); };

  const removeQuestion = (qIdx) => setQuizForm({ ...quizForm, questions: quizForm.questions.filter((_, i) => i !== qIdx) });

  const generateQuizWithAI = async () => {
    if (levelForm.content.length === 0 || levelForm.content[0] === '') {
      alert('Please add level content first before generating quiz.');
      return;
    }

    if (!window.confirm('Generate quiz questions using AI? This will replace any existing questions.')) {
      return;
    }

    setGeneratingQuiz(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/quiz/generate`,
        {
          content: levelForm.content,
          questionCount: 5
        },
        { headers: { email: user.email } }
      );

      if (res.data.success) {
        // Update quiz form with generated questions
        setQuizForm({
          ...quizForm,
          questions: res.data.questions
        });

        // Switch to quiz tab and enable quiz
        setFormTab('quiz');
        setLevelForm({ ...levelForm, hasQuiz: true });

        alert(`✅ Successfully generated ${res.data.count} quiz questions!`);
      }

    } catch (err) {
      console.error('Quiz generation error:', err);
      alert(`Failed to generate quiz: ${err.response?.data?.message || err.message}`);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (loading) return <div className='min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500'>Loading...</div>;

  return (
    <div className='flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden'>
      <div className='flex-1 flex flex-col min-w-0'>
        <header className='h-12 md:h-14 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-3 md:px-6 shrink-0'>
          <div className='flex items-center gap-2 md:gap-4'>
            <img src={RankUpLogo} alt='RankUp' className='h-12 opacity-80 md:hidden' />
            <div className='h-3 w-px bg-zinc-900 md:hidden ' />
            <span className='text-[8px] md:text-[10px] font-bold text-zinc-600 uppercase tracking-widest'>Admin</span>
          </div>
          <div className='flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[9px] font-bold text-emerald-500 uppercase'>
            <span className='w-1 md:w-1.5 h-1 md:h-1.5 bg-emerald-500 rounded-full' /> Online
          </div>
        </header>

        <main className='flex-1 overflow-auto p-3 md:p-6 space-y-4 md:space-y-6'>
          <div className='flex flex-col md:flex-row justify-between md:items-end gap-3'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold text-white tracking-tight'>
                {viewMode === 'users' ? 'User Management' : 'Level Management'}
              </h2>
              <p className='text-[10px] md:text-xs text-zinc-500 mt-0.5 md:mt-1'>
                {viewMode === 'users' ? 'View registered students' : 'Add or edit learning levels'}
              </p>
            </div>
            {viewMode === 'modules' && activeLevel === null && (
              <button onClick={() => setActiveLevel('new')} className='bg-white text-black text-[10px] md:text-xs font-bold px-4 md:px-5 py-2 rounded shadow-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer'>
                <Plus size={12} className='md:w-3.5 md:h-3.5' /> Add Level
              </button>
            )}
            {viewMode === 'users' && (
              <button onClick={() => setViewMode('modules')} className='bg-zinc-800 text-zinc-400 text-[10px] md:text-xs font-bold px-4 md:px-5 py-2 rounded shadow-lg hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer'>
                Back to Modules
              </button>
            )}
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4'>
            {[{ label: 'Modules', value: stats.modules, action: () => setViewMode('modules') }, { label: 'Levels', value: stats.levels, action: () => setViewMode('modules') }, { label: 'Users', value: stats.students, action: () => setViewMode('users') }, { label: 'Status', value: stats.status }].map((s, i) => (
              <div key={i} onClick={s.action} className={`bg-zinc-900/50 border border-zinc-900 p-2 md:p-4 rounded-lg ${s.action ? 'cursor-pointer hover:bg-zinc-900' : ''}`}>
                <p className='text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5 md:mb-1'>{s.label}</p>
                <p className='text-sm md:text-xl font-bold text-white'>{s.value}</p>
              </div>
            ))}
          </div>

          {viewMode === 'users' ? (
            <div className='bg-zinc-900/50 border border-zinc-900 rounded-lg overflow-hidden'>
              <div className='px-3 md:px-6 py-2 md:py-4 bg-zinc-900/80 border-b border-zinc-900 text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest'>
                Registered Students
              </div>
              <table className='w-full text-left'>
                <thead className='text-[9px] font-bold text-zinc-700 uppercase border-b border-zinc-900'>
                  <tr>
                    <th className='px-6 py-3'>Avatar</th>
                    <th className='px-6 py-3'>Username</th>
                    <th className='px-6 py-3'>Email</th>
                    <th className='px-6 py-3'>XP / Score</th>
                    <th className='px-6 py-3'>Solved Problems</th>
                  </tr>
                </thead>
                <tbody className='text-sm'>
                  {users.map(u => (
                    <tr key={u._id} className='border-b border-zinc-900/40 hover:bg-zinc-900/20 transition-colors'>
                      <td className='px-6 py-4'>
                        <img src={u.avatar} alt="av" className="w-8 h-8 rounded-full border border-zinc-700" />
                      </td>
                      <td className='px-6 py-4 font-bold text-zinc-300'>{u.username || 'Unset'}</td>
                      <td className='px-6 py-4 text-zinc-500'>{u.email}</td>
                      <td className='px-6 py-4 text-emerald-400 font-mono'>{u.totalScore} XP</td>
                      <td className='px-6 py-4 text-zinc-400'>{u.solvedProblemsCount}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="5" className="p-10 text-center text-zinc-600">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6 pb-10 md:pb-20'>
              <div className='lg:col-span-3'>
                <div className='flex items-center justify-between mb-2 md:mb-3 lg:block'>
                  <p className='text-[8px] md:text-[9px] font-bold text-zinc-700 uppercase tracking-widest'>Modules</p>
                  <button onClick={() => setShowModules(!showModules)} className='lg:hidden text-zinc-600 cursor-pointer'><Menu size={16} /></button>
                </div>
                <div className={`space-y-1 md:space-y-2 ${showModules ? 'block' : 'hidden lg:block'}`}>
                  {modules.map(m => (
                    <button key={m._id} onClick={() => { setSelectedModule(m); setActiveLevel(null); setShowModules(false); }}
                      className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded border text-[10px] md:text-xs font-bold transition-all uppercase tracking-wide cursor-pointer ${selectedModule?._id === m._id ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-500 border-zinc-900 hover:border-zinc-700'}`}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className='lg:col-span-9'>
                {activeLevel === null ? (
                  <div className='bg-zinc-900/50 border border-zinc-900 rounded-lg overflow-hidden'>
                    <div className='px-3 md:px-6 py-2 md:py-4 bg-zinc-900/80 border-b border-zinc-900 text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest'>
                      {selectedModule?.name} Levels
                    </div>
                    <div className='block md:hidden'>
                      {levels.map(l => (
                        <div key={l._id} className='p-3 border-b border-zinc-900/40'>
                          <div className='flex justify-between items-start mb-2'>
                            <div className='flex-1'>
                              <h3 className='font-bold text-zinc-300 text-sm mb-1'>{l.title}</h3>
                              <p className='text-[10px] text-zinc-600'>XP: {l.xpReward}</p>
                            </div>
                            <button onClick={() => togglePublish(l._id, l.isPublished)} className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer ${l.isPublished ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                              {l.isPublished ? 'Live' : 'Draft'}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => editLevel(l)} className='text-zinc-700 hover:text-blue-500 transition-colors text-xs cursor-pointer'><Pencil size={14} /></button>
                            <button onClick={() => deleteLevel(l._id)} className='text-zinc-700 hover:text-red-500 transition-colors text-xs cursor-pointer'><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <table className='w-full text-left hidden md:table'>
                      <thead className='text-[9px] font-bold text-zinc-700 uppercase border-b border-zinc-900'>
                        <tr><th className='px-6 py-3'>Status</th><th className='px-6 py-3'>Level Title</th><th className='px-6 py-3'>XP</th><th className='px-6 py-3 text-right'>Actions</th></tr>
                      </thead>
                      <tbody className='text-sm'>
                        {levels.map(l => (
                          <tr key={l._id} className='border-b border-zinc-900/40 hover:bg-zinc-900/20 transition-colors'>
                            <td className='px-6 py-4'>
                              <button onClick={() => togglePublish(l._id, l.isPublished)} className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer ${l.isPublished ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                                {l.isPublished ? 'Live' : 'Draft'}
                              </button>
                            </td>
                            <td className='px-6 py-4 font-bold text-zinc-300'>{l.title}</td>
                            <td className='px-6 py-4 text-zinc-500'>{l.xpReward}</td>
                            <td className='px-6 py-4 text-right flex justify-end gap-3'>
                              <button onClick={() => editLevel(l)} className='text-zinc-500 hover:text-white transition-colors cursor-pointer'><Pencil size={16} /></button>
                              <button onClick={() => deleteLevel(l._id)} className='text-zinc-700 hover:text-red-500 transition-colors cursor-pointer'><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {levels.length === 0 && <div className='p-6 md:p-10 text-center text-[10px] md:text-xs text-zinc-600 font-bold'>No levels found</div>}
                  </div>
                ) : (
                  <div className='bg-zinc-900/80 border border-zinc-900 rounded-lg overflow-hidden shadow-2xl'>
                    <div className='border-b border-zinc-900 flex bg-zinc-950/50 overflow-x-auto'>
                      {['theory', 'quiz', 'game'].map(t => (
                        <button key={t} onClick={() => setFormTab(t)} className={`px-3 md:px-6 py-2 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${formTab === t ? 'text-white border-b-2 border-white' : 'text-zinc-700 hover:text-zinc-400'}`}>
                          {t === 'theory' && <><Book size={10} className='inline mr-1 md:mr-2 md:w-3 md:h-3' /> Theory</>}
                          {t === 'quiz' && <><HelpCircle size={10} className='inline mr-1 md:mr-2 md:w-3 md:h-3' /> Quiz {levelForm.hasQuiz && ''}</>}
                          {t === 'game' && <><Gamepad size={10} className='inline mr-1 md:mr-2 md:w-3 md:h-3' /> Game {levelForm.hasGame && ''}</>}
                        </button>
                      ))}
                      <button onClick={() => { setActiveLevel(null); resetFields(); }} className='ml-auto px-3 md:px-6 py-2 md:py-3 text-[9px] md:text-[10px] font-bold text-zinc-700 hover:text-white uppercase transition-all flex items-center gap-1 md:gap-2 cursor-pointer'>
                        <X size={12} className='md:w-3.5 md:h-3.5' /> Cancel
                      </button>
                    </div>

                    <div className='p-3 md:p-8 space-y-4 md:space-y-6'>
                      {formTab === 'theory' && (
                        <div className='space-y-4 md:space-y-6 max-w-2xl'>
                          <div className='flex flex-col md:flex-row gap-3 md:gap-4'>
                            <div className='flex-1'>
                              <label className='text-[8px] md:text-[9px] font-bold text-zinc-700 uppercase block mb-1 md:mb-1.5'>Level Title</label>
                              <input type='text' value={levelForm.title} onChange={e => setLevelForm({ ...levelForm, title: e.target.value })} className='w-full bg-zinc-950 border border-zinc-900 p-2 md:p-3 rounded text-xs md:text-sm outline-none focus:border-zinc-700' placeholder='e.g., Intro to Algebra' />
                            </div>
                            <div className='w-20 md:w-24'>
                              <label className='text-[8px] md:text-[9px] font-bold text-zinc-700 uppercase block mb-1 md:mb-1.5'>XP</label>
                              <input type='number' value={levelForm.xpReward} onChange={e => setLevelForm({ ...levelForm, xpReward: parseInt(e.target.value) })} className='w-full bg-zinc-950 border border-zinc-900 p-2 md:p-3 rounded text-xs md:text-sm outline-none focus:border-zinc-700' />
                            </div>
                          </div>
                          <div>
                            <label className='text-[8px] md:text-[9px] font-bold text-zinc-700 uppercase block mb-1 md:mb-1.5'>Description</label>
                            <textarea value={levelForm.description} onChange={e => setLevelForm({ ...levelForm, description: e.target.value })} className='w-full bg-zinc-950 border border-zinc-900 p-2 md:p-3 rounded text-xs md:text-sm h-20 md:h-24 outline-none resize-none focus:border-zinc-700' placeholder='Brief description...' />
                          </div>
                          <div className='space-y-2 md:space-y-3'>
                            <div className='flex justify-between items-center'>
                              <span className='text-[8px] md:text-[9px] font-bold text-zinc-700 uppercase tracking-widest'>Content (Paragraphs)</span>
                              <button onClick={addParagraph} className='text-[8px] md:text-[9px] font-bold bg-zinc-800 hover:bg-zinc-700 px-2 md:px-3 py-1 md:py-1.5 rounded transition-all cursor-pointer'>+ Add Paragraph</button>
                            </div>
                            {levelForm.content.map((paragraph, i) => (
                              <div key={i} className='flex gap-1 md:gap-2 items-start'>
                                <textarea
                                  value={paragraph}
                                  onChange={e => updateParagraph(i, e.target.value)}
                                  className='flex-1 bg-zinc-950 border border-zinc-900 p-2 md:p-3 rounded text-xs md:text-sm h-32 md:h-40 outline-none resize-vertical'
                                  placeholder='Enter paragraph content. Write complete sentences that will be stored directly in the database.'
                                />
                                <button onClick={() => removeParagraph(i)} className='text-zinc-800 hover:text-red-500 transition-colors cursor-pointer mt-2'>
                                  <Trash2 size={12} className='md:w-3.5 md:h-3.5' />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className='flex flex-col md:flex-row gap-3 md:gap-6 pt-3 md:pt-4 border-t border-zinc-900'>
                            <label className='flex items-center gap-2 md:gap-3 cursor-pointer'>
                              <input type='checkbox' checked={levelForm.hasQuiz} onChange={e => setLevelForm({ ...levelForm, hasQuiz: e.target.checked })} className='w-3 h-3 md:w-4 md:h-4' />
                              <span className='text-[10px] md:text-xs font-bold text-zinc-500 uppercase'>Quiz</span>
                            </label>
                            <label className='flex items-center gap-2 md:gap-3 cursor-pointer'>
                              <input type='checkbox' checked={levelForm.hasGame} onChange={e => setLevelForm({ ...levelForm, hasGame: e.target.checked })} className='w-3 h-3 md:w-4 md:h-4' />
                              <span className='text-[10px] md:text-xs font-bold text-zinc-500 uppercase'>Game</span>
                            </label>
                            <label className='flex items-center gap-2 md:gap-3 cursor-pointer'>
                              <input type='checkbox' checked={levelForm.isPublished} onChange={e => setLevelForm({ ...levelForm, isPublished: e.target.checked })} className='w-3 h-3 md:w-4 md:h-4' />
                              <span className='text-[10px] md:text-xs font-bold text-zinc-500 uppercase'>Publish</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {formTab === 'quiz' && (
                        <div className='space-y-4 md:space-y-6 max-w-2xl'>
                          <div className='flex justify-between items-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4'>
                            <div>
                              <p className='text-xs md:text-sm font-bold text-blue-300 mb-1'>
                                🤖 AI-Powered Quiz Generation
                              </p>
                              <p className='text-[9px] md:text-[10px] text-blue-400/60'>
                                Automatically generate quiz questions from your level content using Gemini AI
                              </p>
                            </div>
                            <button
                              onClick={generateQuizWithAI}
                              disabled={generatingQuiz || levelForm.content.length === 0}
                              className='px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-[10px] md:text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-blue-500/20'
                            >
                              {generatingQuiz ? (
                                <>
                                  <div className='w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <span className="text-sm">✨</span>
                                  Generate Quiz
                                </>
                              )}
                            </button>
                          </div>
                          {levelForm.hasQuiz ? (
                            <>
                              {quizForm.questions.map((q, qIdx) => (
                                <div key={qIdx} className='p-3 md:p-4 bg-zinc-950 border border-zinc-900 rounded-lg space-y-3 md:space-y-4'>
                                  <div className='flex items-center gap-2'>
                                    <input type='text' placeholder='Question' value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} className='flex-1 bg-zinc-900 border border-zinc-800 p-2 md:p-3 rounded text-[10px] md:text-xs outline-none' />
                                    <button onClick={() => removeQuestion(qIdx)} className='text-zinc-700 hover:text-red-500 transition-colors p-2' title="Delete Question"><Trash2 size={16} /></button>
                                  </div>
                                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                                    {q.options.map((o, oIdx) => (
                                      <div key={oIdx} className='flex gap-2 items-center'>
                                        <button onClick={() => setCorrectAnswer(qIdx, o)} className={`w-6 h-6 md:w-8 md:h-8 rounded border transition-all flex items-center justify-center cursor-pointer ${q.correctAnswer === o && o !== '' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}>
                                          {q.correctAnswer === o && o !== '' ? <CheckCircle size={12} className='md:w-3.5 md:h-3.5' /> : <Circle size={12} className='md:w-3.5 md:h-3.5' />}
                                        </button>
                                        <input type='text' placeholder={`Opt ${oIdx + 1}`} value={o} onChange={e => updateOption(qIdx, oIdx, e.target.value)} className='flex-1 bg-zinc-900 border border-zinc-800 p-1.5 md:p-2 rounded text-[9px] md:text-[10px] outline-none' />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <button onClick={addQuestion} className='w-full py-2 md:py-3 border border-dashed border-zinc-800 text-zinc-700 hover:text-zinc-400 hover:border-zinc-600 text-[9px] md:text-[10px] font-bold uppercase rounded transition-all cursor-pointer'>+ Add Question</button>
                            </>
                          ) : <div className='p-6 md:p-10 text-center text-[10px] md:text-xs text-zinc-700'>Quiz disabled</div>}
                        </div>
                      )}

                      {formTab === 'game' && (
                        <div className='space-y-4 md:space-y-6 max-w-xl'>
                          {levelForm.hasGame ? (
                            <>
                              <div>
                                <label className='text-[8px] md:text-[9px] font-bold text-zinc-700 uppercase block mb-1 md:mb-1.5'>Game Name</label>
                                <input type='text' value={gameForm.name} onChange={e => setGameForm({ ...gameForm, name: e.target.value })} className='w-full bg-zinc-950 border border-zinc-900 p-2 md:p-3 rounded text-xs md:text-sm outline-none' placeholder='e.g., Math Puzzle' />
                              </div>
                              <div className='flex gap-1 md:gap-2'>
                                {['logic', 'reflex', 'simulation'].map(t => (
                                  <button key={t} onClick={() => setGameForm({ ...gameForm, type: t })} className={`flex-1 py-2 md:py-3 text-[8px] md:text-[9px] font-black uppercase border transition-all cursor-pointer ${gameForm.type === t ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700'}`}>{t}</button>
                                ))}
                              </div>
                              <div>
                                <label className='text-[8px] md:text-[9px] font-bold text-zinc-700 uppercase block mb-1 md:mb-1.5'>Instructions</label>
                                <textarea value={gameForm.instructions} onChange={e => setGameForm({ ...gameForm, instructions: e.target.value })} className='w-full bg-zinc-950 border border-zinc-900 p-2 md:p-3 rounded text-xs md:text-sm h-20 md:h-24 outline-none resize-none' placeholder='How to play...' />
                              </div>
                            </>
                          ) : <div className='p-6 md:p-10 text-center text-[10px] md:text-xs text-zinc-700'>Game disabled</div>}
                        </div>
                      )}

                      <div className='pt-4 md:pt-8 border-t border-zinc-900 flex gap-3 md:gap-4'>
                        <button onClick={saveLevel} className='bg-white text-black px-6 md:px-8 py-2 md:py-2.5 rounded text-[10px] md:text-xs font-bold hover:bg-zinc-300 transition-all flex items-center gap-1.5 md:gap-2 cursor-pointer'>
                          <Save size={12} className='md:w-3.5 md:h-3.5' /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
