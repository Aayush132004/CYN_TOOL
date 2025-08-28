

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, X, Shield, Users, AlertTriangle, FileText, Trash2, Loader, ListChecks } from 'lucide-react';
import axios from 'axios';

// NEW: Loading Screen Component
const LoadingScreen = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-fade-in-fast">
        <Loader className="w-16 h-16 text-[#00ff41] animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-[#00ff41] tracking-widest">ANALYZING METADATA</h2>
        <p className="text-[#666666] mt-2">Establishing secure connection... Please wait.</p>
    </div>
);

const StatCard = ({ icon: Icon, label, value, valueColor, borderColor }) => (
    <div className={`bg-gradient-to-br from-black/50 to-black/20 backdrop-blur-sm rounded-2xl border border-neutral-800 p-6 transition-all duration-300 shadow-lg hover:border-[${borderColor}]/50 hover:shadow-[${borderColor}]/20 hover:-translate-y-1`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-neutral-400 text-sm">{label}</p>
                <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
            </div>
            <Icon className={`w-8 h-8 text-[${borderColor}]/50`} />
        </div>
    </div>
);

// CHANGED: Added onViewDetails prop and onClick handler
const GroupCard = ({ group, index, onDelete, onViewDetails }) => (
    <div
        onClick={() => onViewDetails(group)}
        className="group relative bg-gradient-to-br from-[#0a0a0a] to-[#111111] rounded-2xl border border-[#1a1a1a] transition-all duration-500 hover:border-[#00ff41] hover:shadow-2xl hover:shadow-[#00ff41]/20 animate-fade-in overflow-hidden hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{ backgroundImage: `linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
        </div>
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${group.status === 'active' ? 'bg-[#00ff41]' : 'bg-[#ff7043]'} animate-pulse`} title={`Status: ${group.status}`}></div>
            <button onClick={(e) => { e.stopPropagation(); onDelete(group.id); }} className="text-neutral-600 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100" aria-label={`Delete group ${group.name}`} title="Delete Group">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
        <div className="relative z-10">
            <div className="px-6 py-4 border-b border-[#1a1a1a] group-hover:border-[#00ff41]/30 transition-colors duration-300">
                <h3 className="text-lg font-bold text-[#e0e0e0] truncate group-hover:text-[#00ff41] transition-colors duration-300 pr-12">
                    <Shield className="inline w-5 h-5 mr-2 text-[#00ff41]" />
                    {group.name}
                </h3>
                <p className="text-xs text-[#666666] mt-1">Updated {group.lastUpdate}</p>
            </div>
            <div className="p-6">
                <div className="flex justify-center items-center space-x-8">
                    <div className="text-center transform group-hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-[#ff1744]/20 to-[#d32f2f]/10 border-2 border-[#ff1744] relative overflow-hidden">
                                <div className="absolute inset-0 rounded-full border-2 border-[#ff1744] animate-ping opacity-20"></div>
                                <span className="text-3xl font-bold text-[#ff1744]">{group.suspiciousUsers}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#ff1744] rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 text-black" />
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-[#ff1744] font-semibold">SUSPICIOUS</p>
                        <p className="text-xs text-[#888888]">High Priority</p>
                    </div>
                    <div className="text-center transform group-hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00ff41]/20 to-[#4caf50]/10 border-2 border-[#00ff41] relative overflow-hidden">
                                <div className="absolute inset-0 rounded-full border-2 border-[#00ff41] animate-pulse opacity-30"></div>
                                <span className="text-3xl font-bold text-[#00ff41]">{group.normalUsers}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#00ff41] rounded-full flex items-center justify-center">
                                <Users className="w-3 h-3 text-black" />
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-[#00ff41] font-semibold">NORMAL</p>
                        <p className="text-xs text-[#888888]">Verified</p>
                    </div>
                </div>
                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs text-[#888888]">
                        <span>Threat Level</span>
                        <span>{group.normalUsers + group.suspiciousUsers > 0 ? Math.round((group.suspiciousUsers / (group.suspiciousUsers + group.normalUsers)) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 transition-all duration-1000" style={{ width: `${group.normalUsers + group.suspiciousUsers > 0 ? (group.suspiciousUsers / (group.suspiciousUsers + group.normalUsers)) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 animate-fade-in-fast" onClick={onClose}></div>
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111111] rounded-2xl w-full max-w-2xl border border-[#1a1a1a] shadow-2xl shadow-[#00ff41]/10 animate-modal-in">
                    {children}
                </div>
            </div>
        </>
    );
};

const Home = () => {
    // NEW: State for loading and detail modal
    const [isLoading, setIsLoading] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // CHANGED: Added 'suspiciousUserDetails' to initial state for data consistency
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState({ groupName: '', metadataFile: null });

    const closeFormModal = useCallback(() => { setIsFormModalOpen(false); setFormData({ groupName: '', metadataFile: null }); }, []);
    
    const openDeleteModal = (id) => { setGroupToDelete(id); setIsDeleteModalOpen(true); };
    const closeDeleteModal = () => { setGroupToDelete(null); setIsDeleteModalOpen(false); };

    // NEW: Functions to handle the detail modal
    const openDetailModal = (group) => { setSelectedGroup(group); setIsDetailModalOpen(true); };
    const closeDetailModal = () => { setSelectedGroup(null); setIsDetailModalOpen(false); };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.metadataFile) {
            alert("Please upload a JSON file");
            return;
        }

        setIsLoading(true); // Start loading

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    const res = await axios.post("https://hack-fe0t.onrender.com/predict", jsonContent, {
                        headers: { "Content-Type": "application/json" },
                    });

                    console.log("✅ API Response:", res.data);

                    // CHANGED: Now also stores the detailed list of suspicious users
                    const newGroup = {
                        id: Date.now(),
                        name: formData.groupName,
                        suspiciousUsers: res.data.suspicious_users.length || 0,
                        suspiciousUserDetails: res.data.suspicious_users || [],
                        normalUsers: Math.floor(Math.random() * 500) + 100,
                        status: "active",
                        lastUpdate: "just now",
                    };
                    setGroups((prev) => [newGroup, ...prev]);
                    closeFormModal();
                } catch (err) {
                    console.error("❌ Error parsing JSON or during API call:", err);
                    alert("There was an error processing your file. Please check the console.");
                } finally {
                    setIsLoading(false); // Stop loading
                }
            };
            reader.readAsText(formData.metadataFile);
        } catch (error) {
            console.error("❌ Top-level error:", error);
            alert("An unexpected error occurred. Please check the console.");
            setIsLoading(false); // Stop loading on outer error too
        }
    };

    const handleDeleteGroup = () => {
        if (groupToDelete) {
            setGroups(prev => prev.filter(group => group.id !== groupToDelete));
            closeDeleteModal();
        }
    };

    // CHANGED: Escape key now closes the new detail modal as well
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                if (isFormModalOpen) closeFormModal();
                if (isDeleteModalOpen) closeDeleteModal();
                if (isDetailModalOpen) closeDetailModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isFormModalOpen, isDeleteModalOpen, isDetailModalOpen, closeFormModal]);

    return (
        <>
            {/* NEW: Conditionally render loading screen */}
            {isLoading && <LoadingScreen />}
            <div 
          className="min-h-screen bg-black text-[#e0e0e0] relative overflow-hidden"
    style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                // ✅ FIX #1: Correctly wrapped the path in the CSS url() function.
                backgroundImage: "url('/Background[1].png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
    }} >
                {/* <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div> */}
                <div className="relative z-10">
                    <header className="bg-black/60 backdrop-blur-lg border-b border-[#1a1a1a] sticky top-0">
                        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <Shield className="w-8 h-8 text-[#00ff41]" />
                                <div>
                                    <h1 className="text-xl font-bold text-[#e0e0e0]">CYN<span className="inline-block w-2 h-5 bg-[#00ff41] ml-1 animate-pulse"></span></h1>
                                    <p className="text-xs text-[#666666]">Secure Government Network • Clearance Level: ALPHA</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-[#00ff41]" />
                                <span className="text-[#888888]">Status: <span className="text-[#00ff41] font-semibold">[OPERATIONAL]</span></span>
                            </div>
                        </div>
                    </header>
                    <main className="max-w-7xl mx-auto px-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard icon={FileText} label="Total Groups" value={groups.length} valueColor="text-[#00ff41]" borderColor="#00ff41" />
                            <StatCard icon={AlertTriangle} label="Suspicious Total" value={groups.reduce((s, g) => s + g.suspiciousUsers, 0)} valueColor="text-[#ff1744]" borderColor="red-500" />
                            <StatCard icon={Users} label="Normal Total" value={groups.reduce((s, g) => s + g.normalUsers, 0)} valueColor="text-[#00ff41]" borderColor="#00ff41" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {/* CHANGED: Passed onViewDetails to GroupCard */}
                            {groups.map((group, index) => (<GroupCard key={group.id} group={group} index={index} onDelete={openDeleteModal} onViewDetails={openDetailModal} />))}
                        </div>
                        {groups.length === 0 && (
                            <div className="text-center py-20 col-span-full">
                                <Shield className="w-16 h-16 text-[#333333] mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-[#888888] mb-2">SYSTEM_READY</h2>
                                <p className="text-[#666666]">Initialize new analysis group to begin monitoring</p>
                            </div>
                        )}
                    </main>
                </div>
                <div className="fixed bottom-8 right-8 z-30">
                    <button onClick={() => setIsFormModalOpen(true)} className="group bg-gradient-to-r from-[#00ff41] to-[#4caf50] text-black font-bold py-4 px-6 rounded-2xl shadow-2xl shadow-[#00ff41]/30 transition-all duration-300 transform hover:scale-105 hover:shadow-[#00ff41]/50 flex items-center space-x-3">
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        <span>NEW_GROUP</span>
                    </button>
                </div>
                <Modal isOpen={isFormModalOpen} onClose={closeFormModal}>
                    <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#e0e0e0]">CREATE_NEW_GROUP</h2>
                        <button onClick={closeFormModal} className="text-[#666666] hover:text-[#ff1744] p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label htmlFor="groupName" className="block text-sm font-semibold text-[#00ff41] mb-2">GROUP_IDENTIFIER</label>
                            <input type="text" id="groupName" name="groupName" value={formData.groupName} onChange={handleInputChange} required className="w-full bg-black/50 border-2 border-[#1a1a1a] rounded-xl px-4 py-3 text-[#e0e0e0] focus:outline-none focus:border-[#00ff41] transition-colors" placeholder="THREAT_ANALYSIS_BETA" />
                        </div>
                        <div>
                            <label htmlFor="metadataFile" className="block text-sm font-semibold text-[#00ff41] mb-2">METADATA_UPLOAD</label>
                            <input type="file" accept=".json" id="metadataFile" name="metadataFile" onChange={handleInputChange} required className="w-full text-sm text-[#888888] file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:font-semibold file:bg-[#1a1a1a] file:text-[#e0e0e0] hover:file:bg-[#00ff41] hover:file:text-black transition-all cursor-pointer border-2 border-[#1a1a1a] rounded-xl p-3 hover:border-[#00ff41]" />
                        </div>
                        <div className="flex justify-end pt-6 space-x-4">
                            <button type="button" onClick={closeFormModal} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#888888] font-semibold py-3 px-6 rounded-xl transition-all">CANCEL</button>
                            <button type="submit" className="bg-gradient-to-r from-[#00ff41] to-[#4caf50] text-black font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#00ff41]/30">EXECUTE</button>
                        </div>
                    </form>
                </Modal>
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <div className="p-8 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-red-500">CONFIRM_DELETION</h2>
                        <p className="text-neutral-400 mt-2">Are you sure you want to delete this group? <br />This action cannot be undone.</p>
                        <div className="flex justify-center mt-8 space-x-4">
                            <button onClick={closeDeleteModal} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#888888] font-semibold py-3 px-6 rounded-xl transition-all w-32">CANCEL</button>
                            <button onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-red-500/30 w-40">CONFIRM</button>
                        </div>
                    </div>
                </Modal>
                {/* NEW: Detail Modal for Suspicious Users */}
                <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal}>
                    {selectedGroup && (
                        <div>
                            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[#ff1744] flex items-center"><ListChecks className="w-6 h-6 mr-3" />SUSPICIOUS_USER_LOG</h2>
                                <button onClick={closeDetailModal} className="text-[#666666] hover:text-[#ff1744] p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <p className="text-sm text-[#888888] mb-4">Detailed analysis for group: <span className="text-[#00ff41] font-semibold">{selectedGroup.name}</span></p>
                                {selectedGroup.suspiciousUserDetails && selectedGroup.suspiciousUserDetails.length > 0 ? (
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b border-[#333333] text-[#888888]">
                                            <tr>
                                                <th className="p-3">RANK</th>
                                                <th className="p-3">USER_ID</th>
                                                <th className="p-3">FLAGS</th>
                                                <th className="p-3 text-right">PROBABILITY</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedGroup.suspiciousUserDetails.map((user) => (
                                                <tr key={user.user_id} className="border-b border-[#1a1a1a] hover:bg-white/5">
                                                    <td className="p-3 font-bold text-white">{user.rank}</td>
                                                    <td className="p-3 text-white">{user.user_id}</td>
                                                    <td className="p-3 text-[#ff1744]">{user.flags}</td>
                                                    <td className="p-3 text-right font-bold text-[#ff1744]">{user.probability}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-10">
                                        <Shield className="w-12 h-12 text-[#333333] mx-auto mb-4" />
                                        <p className="text-[#666666]">No suspicious user data available for this group.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
            <style jsx global>{` @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } } @keyframes modalIn { from { opacity: 0; transform: translateY(-20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; } .animate-fade-in-fast { animation: fadeInFast 0.3s ease-out forwards; } .animate-modal-in { animation: modalIn 0.3s ease-out forwards; } `}</style>
        </>
  
    
    );
};

export default Home;