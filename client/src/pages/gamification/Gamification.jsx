import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getCategories,
  getChallenges,
  createChallenge,
  updateChallengeStatus,
  deleteChallenge,
  getChallengeParticipations,
  createChallengeParticipation,
  decideChallengeParticipation,
  getBadges,
  createBadge,
  getEmployeeBadges,
  getRewards,
  createReward,
  redeemReward,
  getLeaderboard,
} from '../../services/index.js';

const TABS = [
  { key: 'challenges', label: 'Challenges' },
  { key: 'badges', label: 'Badges' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'leaderboard', label: 'Leaderboard' },
];

const STATUS_FLOW = {
  draft: ['active', 'archived'],
  active: ['under_review', 'archived'],
  under_review: ['completed', 'active', 'archived'],
  completed: ['archived'],
  archived: [],
};

const Gamification = () => {
  const { user, isManager, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('challenges');
  const [categories, setCategories] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [badges, setBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');
  const [challengeForm, setChallengeForm] = useState({ title: '', category_id: '', description: '', xp: 50, difficulty: 'easy', evidence_required: false, deadline: '' });
  const [badgeForm, setBadgeForm] = useState({ name: '', description: '', unlock_metric: 'xp_total', unlock_comparator: '>=', unlock_threshold: 100 });
  const [rewardForm, setRewardForm] = useState({ name: '', description: '', points_required: 50, stock: 10 });

  useEffect(() => {
    getCategories('challenge').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'challenges') {
      getChallenges().then(setChallenges).catch((err) => setError(err.message || 'Unable to load challenges'));
      getChallengeParticipations().then(setParticipations).catch(() => {});
    }
    if (activeTab === 'badges') {
      getBadges().then(setBadges).catch((err) => setError(err.message || 'Unable to load badges'));
      if (user?._id) getEmployeeBadges(user._id).then(setMyBadges).catch(() => {});
    }
    if (activeTab === 'rewards') {
      getRewards().then(setRewards).catch((err) => setError(err.message || 'Unable to load rewards')); 
    }
    if (activeTab === 'leaderboard') {
      getLeaderboard().then(setLeaderboard).catch((err) => setError(err.message || 'Unable to load leaderboard'));
    }
  }, [activeTab, user]);

  const refreshCurrent = async () => {
    setError('');
    if (activeTab === 'challenges') {
      setChallenges(await getChallenges());
      setParticipations(await getChallengeParticipations());
    }
    if (activeTab === 'badges') {
      setBadges(await getBadges());
      if (user?._id) setMyBadges(await getEmployeeBadges(user._id));
    }
    if (activeTab === 'rewards') {
      setRewards(await getRewards());
    }
    if (activeTab === 'leaderboard') {
      setLeaderboard(await getLeaderboard());
    }
  };

  const submitChallenge = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createChallenge({
        ...challengeForm,
        category_id: challengeForm.category_id || null,
        xp: Number(challengeForm.xp),
        deadline: challengeForm.deadline || null,
      });
      setChallengeForm({ title: '', category_id: '', description: '', xp: 50, difficulty: 'easy', evidence_required: false, deadline: '' });
      await refreshCurrent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create challenge');
    }
  };

  const submitBadge = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createBadge({ ...badgeForm, unlock_threshold: Number(badgeForm.unlock_threshold) });
      setBadgeForm({ name: '', description: '', unlock_metric: 'xp_total', unlock_comparator: '>=', unlock_threshold: 100 });
      await refreshCurrent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create badge');
    }
  };

  const submitReward = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createReward({ ...rewardForm, points_required: Number(rewardForm.points_required), stock: Number(rewardForm.stock) });
      setRewardForm({ name: '', description: '', points_required: 50, stock: 10 });
      await refreshCurrent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create reward');
    }
  };

  const joinChallenge = async (challengeId) => {
    setError('');
    try {
      await createChallengeParticipation({ challenge_id: challengeId, employee_id: user._id });
      setParticipations(await getChallengeParticipations());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to join challenge');
    }
  };

  const changeChallengeStatus = async (challengeId, status) => {
    setError('');
    try {
      await updateChallengeStatus(challengeId, status);
      setChallenges(await getChallenges());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update challenge status');
    }
  };

  const approveParticipation = async (id, approve) => {
    setError('');
    try {
      await decideChallengeParticipation(id, { approve });
      setParticipations(await getChallengeParticipations());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to decide participation');
    }
  };

  const redeem = async (rewardId) => {
    setError('');
    try {
      await redeemReward({ employee_id: user._id, reward_id: rewardId });
      if (user?._id) setMyBadges(await getEmployeeBadges(user._id));
      setRewards(await getRewards());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to redeem reward');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gamification</h1>
          <p className="text-slate-500">Launch challenges, rewards, badges and see your leaderboard progress.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {(isManager() || isAdmin()) ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Create Challenge</h2>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={submitChallenge}>
                  <label className="space-y-2 text-sm text-slate-700">
                    Title
                    <input type="text" value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Category
                    <select value={challengeForm.category_id} onChange={(e) => setChallengeForm({ ...challengeForm, category_id: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                      <option value="">None</option>
                      {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    XP reward
                    <input type="number" value={challengeForm.xp} onChange={(e) => setChallengeForm({ ...challengeForm, xp: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Difficulty
                    <select value={challengeForm.difficulty} onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input type="checkbox" checked={challengeForm.evidence_required} onChange={(e) => setChallengeForm({ ...challengeForm, evidence_required: e.target.checked })} className="rounded border-slate-300 text-emerald-600" />
                    Evidence required
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                    Deadline
                    <input type="date" value={challengeForm.deadline} onChange={(e) => setChallengeForm({ ...challengeForm, deadline: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="md:col-span-2 space-y-2 text-sm text-slate-700">
                    Description
                    <textarea value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Create challenge</button>
                </form>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Only Admin and Manager users can create challenges.</div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Active Challenges</h2>
              {!challenges.length ? (
                <p className="text-sm text-slate-500">No challenges published yet.</p>
              ) : (
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <div key={challenge._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{challenge.title}</p>
                          <p className="text-sm text-slate-500">XP: {challenge.xp} • Difficulty: {challenge.difficulty} • Status: {challenge.status}</p>
                          <p className="text-sm text-slate-500 mt-2">{challenge.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {challenge.status !== 'archived' && (isManager() || isAdmin()) && STATUS_FLOW[challenge.status]?.map((next) => (
                            <button key={next} onClick={() => changeChallengeStatus(challenge._id, next)} className="rounded-2xl bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-300">{next}</button>
                          ))}
                          {challenge.status === 'active' && (
                            <button onClick={() => joinChallenge(challenge._id)} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Join</button>
                          )}
                          {(isManager() || isAdmin()) && (
                            <button onClick={async () => { await deleteChallenge(challenge._id); await refreshCurrent(); }} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Participation Requests</h2>
              {!participations.length ? (
                <p className="text-sm text-slate-500">No challenge participation records yet.</p>
              ) : (
                <div className="space-y-3">
                  {participations.map((participation) => (
                    <div key={participation._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{participation.challenge_id?.title || 'Unknown challenge'}</p>
                        <p className="text-sm text-slate-500">Employee: {participation.employee_id?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-500">Status: {participation.approval_status} • XP awarded: {participation.xp_awarded}</p>
                      </div>
                      {(participation.approval_status === 'submitted' && (isManager() || isAdmin())) && (
                        <div className="flex gap-2">
                          <button onClick={() => approveParticipation(participation._id, true)} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Approve</button>
                          <button onClick={() => approveParticipation(participation._id, false)} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-6">
            {(isManager() || isAdmin()) ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Create Badge Rule</h2>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={submitBadge}>
                  <label className="space-y-2 text-sm text-slate-700">
                    Badge name
                    <input type="text" value={badgeForm.name} onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Unlock metric
                    <select value={badgeForm.unlock_metric} onChange={(e) => setBadgeForm({ ...badgeForm, unlock_metric: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                      <option value="xp_total">XP total</option>
                      <option value="completed_challenges">Completed challenges</option>
                      <option value="csr_participations">CSR participations</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Comparator
                    <select value={badgeForm.unlock_comparator} onChange={(e) => setBadgeForm({ ...badgeForm, unlock_comparator: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                      <option value=">=">&gt;=</option>
                      <option value=">">&gt;</option>
                      <option value="==">=</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Threshold
                    <input type="number" value={badgeForm.unlock_threshold} onChange={(e) => setBadgeForm({ ...badgeForm, unlock_threshold: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="md:col-span-2 space-y-2 text-sm text-slate-700">
                    Description
                    <input type="text" value={badgeForm.description} onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Create badge rule</button>
                </form>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Only Admin and Manager users can create badges.</div>
            )}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Available Badges</h2>
              {!badges.length ? (
                <p className="text-sm text-slate-500">No badge rules defined yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {badges.map((badge) => (
                    <div key={badge._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{badge.name}</p>
                      <p className="text-sm text-slate-500">{badge.unlock_metric} {badge.unlock_comparator} {badge.unlock_threshold}</p>
                      <p className="mt-2 text-sm text-slate-500">{badge.description || 'No description provided.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">My Badges</h2>
              {!myBadges.length ? (
                <p className="text-sm text-slate-500">No badges unlocked yet.</p>
              ) : (
                <div className="space-y-3">
                  {myBadges.map((badge) => (
                    <div key={badge._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{badge.badge_id?.name || 'Badge'}</p>
                      <p className="text-sm text-slate-500">Awarded {new Date(badge.awarded_date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {(isManager() || isAdmin()) ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Create Reward</h2>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={submitReward}>
                  <label className="space-y-2 text-sm text-slate-700">
                    Reward name
                    <input type="text" value={rewardForm.name} onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Points required
                    <input type="number" value={rewardForm.points_required} onChange={(e) => setRewardForm({ ...rewardForm, points_required: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Stock
                    <input type="number" value={rewardForm.stock} onChange={(e) => setRewardForm({ ...rewardForm, stock: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="md:col-span-2 space-y-2 text-sm text-slate-700">
                    Description
                    <input type="text" value={rewardForm.description} onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Create reward</button>
                </form>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Only Admin and Manager users can add rewards.</div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Reward Catalog</h2>
              {!rewards.length ? (
                <p className="text-sm text-slate-500">No rewards available.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rewards.map((reward) => (
                    <div key={reward._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{reward.name}</p>
                        <p className="text-sm text-slate-500">{reward.points_required} points required • {reward.stock} in stock</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => redeem(reward._id)} disabled={reward.stock <= 0} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">Redeem</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Leaderboard</h2>
            {!leaderboard.length ? (
              <p className="text-sm text-slate-500">No leaderboard data available.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((row) => (
                  <div key={row.employee_id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{row.name}</p>
                      <p className="text-sm text-slate-500">Department: {row.department || 'Unassigned'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">XP {row.xp_total}</p>
                      <p className="text-sm text-slate-500">Points {row.points_balance}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gamification;
