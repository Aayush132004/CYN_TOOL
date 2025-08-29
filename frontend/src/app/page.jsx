// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { Clock, Plus, X, Shield, Users, AlertTriangle, FileText, Trash2, Loader, ListChecks, Smartphone, Laptop, Bot } from 'lucide-react';
// import axios from 'axios';

// // Define a base URL for your API for easier management
// const API_BASE_URL = "http://localhost:5000";

// // ✅ FIXED: Increased z-index to ensure it appears above all other elements
// const FullScreenLoader = () => (
//     <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center animate-fade-in-fast">
//         <div className="relative w-24 h-24">
//             {/* Spinner Animation */}
//             <div className="absolute inset-0 border-4 border-t-[#00ff41] border-r-[#00ff41]/30 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
//             {/* Static outer ring */}
//             <div className="absolute inset-2 border-2 border-[#00ff41]/20 rounded-full"></div>
//              {/* Pulsing inner glow */}
//             <div className="absolute inset-0 flex items-center justify-center">
//                  <div className="w-8 h-8 bg-[#00ff41]/50 rounded-full animate-pulse blur-lg"></div>
//             </div>
//             <Shield className="absolute inset-0 m-auto w-8 h-8 text-[#00ff41]/80"/>
//         </div>
//     </div>
// );


// const StatCard = ({ icon: Icon, label, value, valueColor, borderColor }) => (
//     <div className={`bg-gradient-to-br from-black/50 to-black/20 backdrop-blur-sm rounded-2xl border border-neutral-800 p-6 transition-all duration-300 shadow-lg hover:border-[${borderColor}]/50 hover:shadow-[${borderColor}]/20 hover:-translate-y-1`}>
//         <div className="flex items-center justify-between">
//             <div>
//                 <p className="text-neutral-400 text-sm">{label}</p>
//                 <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
//             </div>
//             <Icon className={`w-8 h-8 text-[${borderColor}]/50`} />
//         </div>
//     </div>
// );

// const GroupCard = ({ group, index, onDelete, onViewDetails }) => (
//     <div
//         onClick={() => onViewDetails(group)}
//         className="group relative bg-gradient-to-br from-[#0a0a0a] to-[#111111] rounded-2xl border border-[#1a1a1a] transition-all duration-500 hover:border-[#00ff41] hover:shadow-2xl hover:shadow-[#00ff41]/20 animate-fade-in overflow-hidden hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
//         style={{ animationDelay: `${index * 100}ms` }}
//     >
//         <div className="absolute inset-0 opacity-5">
//             <div className="w-full h-full" style={{ backgroundImage: `linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
//         </div>
//         <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full ${group.status === 'active' ? 'bg-[#00ff41]' : 'bg-[#ff7043]'} animate-pulse`} title={`Status: ${group.status}`}></div>
//             <button onClick={(e) => { e.stopPropagation(); onDelete(group.name); }} className="text-neutral-600 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100" aria-label={`Delete group ${group.name}`} title="Delete Group">
//                 <Trash2 className="w-4 h-4" />
//             </button>
//         </div>
//         <div className="relative z-10">
//             <div className="px-6 py-4 border-b border-[#1a1a1a] group-hover:border-[#00ff41]/30 transition-colors duration-300">
//                 <h3 className="text-lg font-bold text-[#e0e0e0] truncate group-hover:text-[#00ff41] transition-colors duration-300 pr-12">
//                     <Shield className="inline w-5 h-5 mr-3 text-[#00ff41]" />
//                     {group.name}
//                 </h3>
//                 <p className="text-xs text-[#666666] mt-1">Updated {group.lastUpdate}</p>
//             </div>
//             <div className="p-6">
//                 <div className="flex justify-around items-center text-center py-4">
//                     <div>
//                         <p className="text-4xl font-bold text-[#ff1744] flex items-center justify-center gap-2">
//                             <AlertTriangle className="w-6 h-6" />
//                             {group.suspiciousUsers}
//                         </p>
//                         <p className="mt-1 text-xs text-[#ff1744] font-semibold tracking-widest uppercase">Suspicious</p>
//                     </div>
//                     <div className="h-12 border-l border-neutral-800"></div>
//                     <div>
//                         <p className="text-4xl font-bold text-[#00ff41] flex items-center justify-center gap-2">
//                             <Users className="w-6 h-6" />
//                             {group.normalUsers}
//                         </p>
//                         <p className="mt-1 text-xs text-[#00ff41] font-semibold tracking-widest uppercase">Normal</p>
//                     </div>
//                 </div>
//                 <div className="mt-6 space-y-2">
//                     <div className="flex justify-between text-xs text-[#888888]">
//                         <span>Threat Level</span>
//                         <span>{group.normalUsers + group.suspiciousUsers > 0 ? Math.round((group.suspiciousUsers / (group.suspiciousUsers + group.normalUsers)) * 100) : 0}%</span>
//                     </div>
//                     <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
//                         <div className="h-full bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 transition-all duration-1000" style={{ width: `${group.normalUsers + group.suspiciousUsers > 0 ? (group.suspiciousUsers / (group.suspiciousUsers + group.normalUsers)) * 100 : 0}%` }}></div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>
// );

// const Modal = ({ isOpen, onClose, children }) => {
//     if (!isOpen) return null;
//     return (
//         <>
//             <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 animate-fade-in-fast" onClick={onClose}></div>
//             <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
//                 <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111111] rounded-2xl w-full max-w-4xl border border-[#1a1a1a] shadow-2xl shadow-[#00ff41]/10 animate-modal-in">
//                     {children}
//                 </div>
//             </div>
//         </>
//     );
// };

// const Home = () => {
//     const [isFormModalOpen, setIsFormModalOpen] = useState(false);
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//     const [groupToDelete, setGroupToDelete] = useState(null);
//     const [selectedGroup, setSelectedGroup] = useState(null);
//     const [groups, setGroups] = useState([]);
//     const [stats, setStats] = useState({ suspiciousTotal: 0, normalTotal: 0 });
//     const [formData, setFormData] = useState({ groupName: '', metadataFile: null, listSize: 10 });
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const closeFormModal = useCallback(() => { setIsFormModalOpen(false); setFormData({ groupName: '', metadataFile: null, listSize: 10 }); }, []);
//     const openDeleteModal = (groupName) => { setGroupToDelete(groupName); setIsDeleteModalOpen(true); };
//     const closeDeleteModal = () => { setGroupToDelete(null); setIsDeleteModalOpen(false); };
//     const openDetailModal = (group) => { setSelectedGroup(group); setIsDetailModalOpen(true); };
//     const closeDetailModal = () => { setSelectedGroup(null); setIsDetailModalOpen(false); };
    
//     const fetchAllData = useCallback(async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/getData`);
//             setStats({
//                 suspiciousTotal: response.data.SuspiciousTotal || 0,
//                 normalTotal: response.data.NormalTotal || 0
//             });
//             const formattedGroups = response.data.groups.map(group => ({
//                 id: group.GroupName,
//                 name: group.GroupName,
//                 suspiciousUsers: group.users.length,
//                 suspiciousUserDetails: group.users,
//                 normalUsers: group.normal_count,
//                 status: 'active',
//                 lastUpdate: 'loaded',
//             }));
//             setGroups(formattedGroups);
//         } catch (error) {
//             console.error("❌ Error fetching data:", error);
//         }
//     }, []);

//     useEffect(() => {
//         fetchAllData();
//     }, [fetchAllData]);

//     const handleInputChange = (e) => {
//         const { name, value, files } = e.target;
//         setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!formData.metadataFile) {
//             alert("Please upload a JSON file");
//             return;
//         }
//         setIsSubmitting(true);
//         try {
//             const reader = new FileReader();
//             reader.onload = async (event) => {
//                 try {
//                     const jsonContent = JSON.parse(event.target.result);
//                     const data = {
//                         Metadata: jsonContent,
//                         GroupName: formData.groupName,
//                     };
//                     await axios.post(`${API_BASE_URL}/predict?listsize=${formData.listSize}`, data, {
//                         headers: { "Content-Type": "application/json" },
//                     });
//                     await fetchAllData(); 
//                     closeFormModal();
//                 } catch (err) {
//                     console.error("❌ Error during API call:", err);
//                     alert("There was an error processing your file. Please check the console.");
//                 } finally {
//                     setIsSubmitting(false);
//                 }
//             };
//             reader.readAsText(formData.metadataFile);
//         } catch (error) {
//             console.error("❌ Top-level error:", error);
//             alert("An unexpected error occurred. Please check the console.");
//             setIsSubmitting(false);
//         }
//     };

//     const handleDeleteGroup = async () => {
//         if (groupToDelete) {
//             try {
//                 await axios.delete(`${API_BASE_URL}/deleteGroup/${groupToDelete}`);
//                 await fetchAllData();
//                 closeDeleteModal();
//             } catch (error) {
//                 console.error("❌ Error deleting group:", error);
//                 alert("Failed to delete the group. Make sure the backend endpoint is configured.");
//             }
//         }
//     };

//     useEffect(() => {
//         const handleEscape = (event) => {
//             if (event.key === 'Escape') {
//                 if (isFormModalOpen) closeFormModal();
//                 if (isDeleteModalOpen) closeDeleteModal();
//                 if (isDetailModalOpen) closeDetailModal();
//             }
//         };
//         document.addEventListener('keydown', handleEscape);
//         return () => document.removeEventListener('keydown', handleEscape);
//     }, [isFormModalOpen, isDeleteModalOpen, isDetailModalOpen, closeFormModal, closeDeleteModal, closeDetailModal]);

//     return (
//         <>
//             {isSubmitting && <FullScreenLoader />}
            
//             <div
//                 className="min-h-screen bg-black text-[#e0e0e0] relative overflow-hidden"
//                 style={{
//                     fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
//                     backgroundImage: "url('/Background[1].png')",
//                     backgroundSize: 'cover',
//                     backgroundPosition: 'center',
//                     backgroundAttachment: 'fixed'
//                 }} >
//                 <div className="relative z-10">
//                     <header className="bg-black/60 backdrop-blur-lg border-b border-[#1a1a1a] sticky top-0">
//                         <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
//                             <div className="flex items-center space-x-4">
//                                 <div className="w-20 h-20 hover:scale-110 transition-transform duration-300">
//                                     <img 
//                                         src="/logo.png" 
//                                         alt="Logo" 
//                                         className="w-full h-full object-contain"
//                                     />
//                                 </div>
//                                 <div>
//                                     <h1 className="text-xl font-bold text-[#e0e0e0]">CYN<span className="inline-block w-2 h-5 bg-[#00ff41] ml-1 animate-pulse"></span></h1>
//                                     <p className="text-xs text-[#666666]">Secure Government Network • Clearance Level: ALPHA</p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center space-x-2 text-sm">
//                                 <Clock className="w-4 h-4 text-[#00ff41]" />
//                                 <span className="text-[#888888]">Status: <span className="text-[#00ff41] font-semibold">[OPERATIONAL]</span></span>
//                             </div>
//                         </div>
//                     </header>
//                     <main className="max-w-7xl mx-auto px-6 py-8">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                             <StatCard icon={FileText} label="Total Groups" value={groups.length} valueColor="text-[#00ff41]" borderColor="#00ff41" />
//                             <StatCard icon={AlertTriangle} label="Suspicious Total" value={stats.suspiciousTotal} valueColor="text-[#ff1744]" borderColor="#ef4444" />
//                             <StatCard icon={Users} label="Normal Total" value={stats.normalTotal} valueColor="text-[#00ff41]" borderColor="#00ff41" />
//                         </div>
//                         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
//                             {groups.map((group, index) => (<GroupCard key={group.name} group={group} index={index} onDelete={openDeleteModal} onViewDetails={openDetailModal} />))}
//                         </div>
//                         {groups.length === 0 && (
//                             <div className="text-center py-20 col-span-full">
//                                 <Shield className="w-16 h-16 text-[#333333] mx-auto mb-4" />
//                                 <h2 className="text-2xl font-bold text-[#888888] mb-2">SYSTEM_READY</h2>
//                                 <p className="text-[#666666]">Initialize new analysis group to begin monitoring</p>
//                             </div>
//                         )}
//                     </main>
//                 </div>
//                 <div className="fixed bottom-8 right-8 z-30 flex items-center gap-4">
//                     <button onClick={() => console.log("Bot Analysis Clicked")} className="group bg-gradient-to-r from-[#00A8FF] to-[#007BFF] text-white font-bold py-4 px-6 rounded-2xl shadow-2xl shadow-[#00A8FF]/30 transition-all duration-300 transform hover:scale-105 hover:shadow-[#00A8FF]/50 flex items-center space-x-3">
//                         <Bot className="w-6 h-6 group-hover:animate-pulse" />
//                         <span>USE_BOT_ANALYSIS</span>
//                     </button>
//                     <button onClick={() => setIsFormModalOpen(true)} className="group bg-gradient-to-r from-[#00ff41] to-[#4caf50] text-black font-bold py-4 px-6 rounded-2xl shadow-2xl shadow-[#00ff41]/30 transition-all duration-300 transform hover:scale-105 hover:shadow-[#00ff41]/50 flex items-center space-x-3">
//                         <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
//                         <span>NEW_GROUP</span>
//                     </button>
//                 </div>

//                 <Modal isOpen={isFormModalOpen} onClose={closeFormModal}>
//                     <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center">
//                         <h2 className="text-xl font-bold text-[#e0e0e0]">CREATE_NEW_GROUP</h2>
//                         <button onClick={closeFormModal} className="text-[#666666] hover:text-[#ff1744] p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
//                     </div>
//                     <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                         <div>
//                             <label htmlFor="groupName" className="block text-sm font-semibold text-[#00ff41] mb-2">GROUP_IDENTIFIER</label>
//                             <input type="text" id="groupName" name="groupName" value={formData.groupName} onChange={handleInputChange} required className="w-full bg-black/50 border-2 border-[#1a1a1a] rounded-xl px-4 py-3 text-[#e0e0e0] focus:outline-none focus:border-[#00ff41] transition-colors" placeholder="THREAT_ANALYSIS_BETA" />
//                         </div>
//                         <div>
//                             <label htmlFor="metadataFile" className="block text-sm font-semibold text-[#00ff41] mb-2">METADATA_UPLOAD</label>
//                             <input type="file" accept=".json" id="metadataFile" name="metadataFile" onChange={handleInputChange} required className="w-full text-sm text-[#888888] file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:font-semibold file:bg-[#1a1a1a] file:text-[#e0e0e0] hover:file:bg-[#00ff41] hover:file:text-black transition-all cursor-pointer border-2 border-[#1a1a1a] rounded-xl p-3 hover:border-[#00ff41]" />
//                         </div>
//                         <div>
//                             <label htmlFor="listSize" className="block text-sm font-semibold text-[#00ff41] mb-2">SUSPICIOUS USER COUNT</label>
//                             <input
//                                 type="number"
//                                 id="listSize"
//                                 name="listSize"
//                                 value={formData.listSize}
//                                 onChange={handleInputChange}
//                                 required
//                                 min="1"
//                                 className="w-full bg-black/50 border-2 border-[#1a1a1a] rounded-xl px-4 py-3 text-[#e0e0e0] focus:outline-none focus:border-[#00ff41] transition-colors"
//                                 placeholder="e.g., 10"
//                             />
//                         </div>
//                         <div className="flex justify-end pt-2 space-x-4">
//                             <button type="button" onClick={closeFormModal} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#888888] font-semibold py-3 px-6 rounded-xl transition-all">CANCEL</button>
//                             <button 
//                                 type="submit" 
//                                 disabled={isSubmitting}
//                                 className="bg-gradient-to-r from-[#00ff41] to-[#4caf50] text-black font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#00ff41]/30 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 EXECUTE
//                             </button>
//                         </div>
//                     </form>
//                 </Modal>
//                 <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
//                     <div className="p-8 text-center">
//                         <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
//                             <AlertTriangle className="h-8 w-8 text-red-500" />
//                         </div>
//                         <h2 className="text-xl font-bold text-red-500">CONFIRM_DELETION</h2>
//                         <p className="text-neutral-400 mt-2">Are you sure you want to delete this group? <br />This action cannot be undone.</p>
//                         <div className="flex justify-center mt-8 space-x-4">
//                             <button onClick={closeDeleteModal} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#888888] font-semibold py-3 px-6 rounded-xl transition-all w-32">CANCEL</button>
//                             <button onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-red-500/30 w-40">CONFIRM</button>
//                         </div>
//                     </div>
//                 </Modal>

//                 <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal}>
//                     {selectedGroup && (
//                         <div>
//                             <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center">
//                                 <h2 className="text-xl font-bold text-[#ff1744] flex items-center"><ListChecks className="w-6 h-6 mr-3" />SUSPICIOUS_USER_LOG</h2>
//                                 <button onClick={closeDetailModal} className="text-[#666666] hover:text-[#ff1744] p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
//                             </div>
//                             <div className="p-6 max-h-[70vh] overflow-y-auto">
//                                 <p className="text-sm text-[#888888] mb-4">Detailed analysis for group: <span className="text-[#00ff41] font-semibold">{selectedGroup.name}</span></p>
//                                 {selectedGroup.suspiciousUserDetails && selectedGroup.suspiciousUserDetails.length > 0 ? (
//                                     <table className="w-full text-left text-sm">
//                                         <thead className="border-b border-[#333333] text-[#888888]">
//                                             <tr>
//                                                 <th className="p-3">RANK</th>
//                                                 <th className="p-3">USER_ID</th>
//                                                 <th className="p-3">LAST KNOWN IP</th>
//                                                 <th className="p-3">DEVICE</th>
//                                                 <th className="p-3">LAST ONLINE</th>
//                                                 <th className="p-3 text-center">FLAGS</th>
//                                                 <th className="p-3 text-right">PROBABILITY</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {selectedGroup.suspiciousUserDetails.map((user) => (
//                                                 <tr key={user.user_id} className="border-b border-[#1a1a1a] hover:bg-white/5">
//                                                     <td className="p-3 font-bold text-white">{user.rank}</td>
//                                                     <td className="p-3 text-white font-mono">{user.user_id}</td>
//                                                     <td className="p-3 text-neutral-400 font-mono">
//                                                         <Link href={`/globe?ip=${user.last_known_ip}`} className="hover:text-[#00ff41] hover:underline transition-colors duration-200">
//                                                             {user.last_known_ip}
//                                                         </Link>
//                                                     </td>
//                                                     <td className="p-3 text-neutral-300 capitalize flex items-center gap-2">
//                                                         {user.device && (user.device.toLowerCase() === 'android' || user.device.toLowerCase() === 'ios') ?
//                                                             <Smartphone className="w-4 h-4 text-neutral-500" /> :
//                                                             <Laptop className="w-4 h-4 text-neutral-500" />}
//                                                         {user.device || 'NA'}
//                                                     </td>
//                                                     <td className="p-3 text-neutral-400 font-mono">{new Date(user.last_online).toLocaleString()}</td>
//                                                     <td className="p-3 text-center text-[#ff1744]">{user.flags}</td>
//                                                     <td className="p-3 text-right font-bold text-[#ff1744]">{user.probability}</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 ) : (
//                                     <div className="text-center py-10">
//                                         <Shield className="w-12 h-12 text-[#333333] mx-auto mb-4" />
//                                         <p className="text-[#666666]">No suspicious user data available for this group.</p>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </Modal>
//             </div>
//             <style jsx global>{` @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } } @keyframes modalIn { from { opacity: 0; transform: translateY(-20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; } .animate-fade-in-fast { animation: fadeInFast 0.3s ease-out forwards; } .animate-modal-in { animation: modalIn 0.3s ease-out forwards; } `}</style>
//         </>
//     );
// };

// export default Home;



'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, Plus, X, Shield, Users, AlertTriangle, FileText, Trash2, Loader, ListChecks, Smartphone, Laptop, Bot } from 'lucide-react';
import axios from 'axios';
import CYNLoader from "../app/components/Loader"

// Define a base URL for your API for easier management
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ✅ NEW: Loader for the very first time the site is visited
// This component simulates a system boot-up to match your site's theme.
// const InitialBootLoader = () => {
//     const [lines, setLines] = useState([]);
//     const bootSequence = [
//         "INITIALIZING SYSTEM...",
//         "CHECKING KERNEL INTEGRITY...",
//         "LOADING SECURITY PROTOCOLS...",
//         "ESTABLISHING SECURE CONNECTION...",
//         "DECRYPTING ALPHA-LEVEL CLEARANCE...",
//         "ACCESS GRANTED.",
//         "WELCOME TO CYN."
//     ];

//     useEffect(() => {
//         let currentLine = 0;
//         const interval = setInterval(() => {
//             if (currentLine < bootSequence.length) {
//                 setLines(prev => [...prev, bootSequence[currentLine]]);
//                 currentLine++;
//             } else {
//                 clearInterval(interval);
//             }
//         }, 450); // 450ms delay between each line appearing

//         return () => clearInterval(interval);
//     }, []); // Empty dependency array ensures this runs only once

//     return (
//         <div className="fixed inset-0 bg-black z-[10000] flex items-center justify-center font-mono text-[#00ff41]">
//             <div className="text-left p-8 max-w-lg w-full">
//                 {lines.map((line, i) => (
//                     <p key={i} className="animate-fade-in-fast text-sm sm:text-base">{line}</p>
//                 ))}
//                 {/* Blinking cursor effect */}
//                 {lines.length < bootSequence.length && (
//                      <div className="inline-block w-3 h-5 bg-[#00ff41] ml-1 animate-pulse"></div>
//                 )}
//             </div>
//         </div>
//     );
// };
<CYNLoader />


const FullScreenLoader = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center animate-fade-in-fast">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-t-[#00ff41] border-r-[#00ff41]/30 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-[#00ff41]/20 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-[#00ff41]/50 rounded-full animate-pulse blur-lg"></div>
            </div>
            <Shield className="absolute inset-0 m-auto w-8 h-8 text-[#00ff41]/80"/>
        </div>
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
            <button onClick={(e) => { e.stopPropagation(); onDelete(group.name); }} className="text-neutral-600 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100" aria-label={`Delete group ${group.name}`} title="Delete Group">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
        <div className="relative z-10">
            <div className="px-6 py-4 border-b border-[#1a1a1a] group-hover:border-[#00ff41]/30 transition-colors duration-300">
                <h3 className="text-lg font-bold text-[#e0e0e0] truncate group-hover:text-[#00ff41] transition-colors duration-300 pr-12">
                    <Shield className="inline w-5 h-5 mr-3 text-[#00ff41]" />
                    {group.name}
                </h3>
                <p className="text-xs text-[#666666] mt-1">Updated {group.lastUpdate}</p>
            </div>
            <div className="p-6">
                <div className="flex justify-around items-center text-center py-4">
                    <div>
                        <p className="text-4xl font-bold text-[#ff1744] flex items-center justify-center gap-2">
                            <AlertTriangle className="w-6 h-6" />
                            {group.suspiciousUsers}
                        </p>
                        <p className="mt-1 text-xs text-[#ff1744] font-semibold tracking-widest uppercase">Suspicious</p>
                    </div>
                    <div className="h-12 border-l border-neutral-800"></div>
                    <div>
                        <p className="text-4xl font-bold text-[#00ff41] flex items-center justify-center gap-2">
                            <Users className="w-6 h-6" />
                            {group.normalUsers}
                        </p>
                        <p className="mt-1 text-xs text-[#00ff41] font-semibold tracking-widest uppercase">Normal</p>
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
                <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111111] rounded-2xl w-full max-w-4xl border border-[#1a1a1a] shadow-2xl shadow-[#00ff41]/10 animate-modal-in">
                    {children}
                </div>
            </div>
        </>
    );
};

const Home = () => {
    // ✅ NEW: State for the initial first-time visit loader
    const [isFirstVisitLoading, setIsFirstVisitLoading] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groups, setGroups] = useState([]);
    const [stats, setStats] = useState({ suspiciousTotal: 0, normalTotal: 0 });
    const [formData, setFormData] = useState({ groupName: '', metadataFile: null, listSize: 10 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const closeFormModal = useCallback(() => { setIsFormModalOpen(false); setFormData({ groupName: '', metadataFile: null, listSize: 10 }); }, []);
    const openDeleteModal = (groupName) => { setGroupToDelete(groupName); setIsDeleteModalOpen(true); };
    const closeDeleteModal = () => { setGroupToDelete(null); setIsDeleteModalOpen(false); };
    const openDetailModal = (group) => { setSelectedGroup(group); setIsDetailModalOpen(true); };
    const closeDetailModal = () => { setSelectedGroup(null); setIsDetailModalOpen(false); };
    
    const fetchAllData = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getData`);
            setStats({
                suspiciousTotal: response.data.SuspiciousTotal || 0,
                normalTotal: response.data.NormalTotal || 0
            });
            const formattedGroups = response.data.groups.map(group => ({
                id: group.GroupName,
                name: group.GroupName,
                suspiciousUsers: group.users.length,
                suspiciousUserDetails: group.users,
                normalUsers: group.normal_count,
                status: 'active',
                lastUpdate: 'loaded',
            }));
            setGroups(formattedGroups);
        } catch (error) {
            console.error("❌ Error fetching data:", error);
        }
    }, []);

    // ✅ NEW: useEffect to handle the first-time visit logic
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisitedCynDashboard');
        if (!hasVisited) {
            setIsFirstVisitLoading(true);
            const timer = setTimeout(() => {
                setIsFirstVisitLoading(false);
                localStorage.setItem('hasVisitedCynDashboard', 'true');
            }, 3500); // This duration allows the boot animation to complete
            
            return () => clearTimeout(timer);
        }
    }, []);


    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

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
        setIsSubmitting(true);
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    const data = {
                        Metadata: jsonContent,
                        GroupName: formData.groupName,
                    };
                    await axios.post(`${API_BASE_URL}/predict?listsize=${formData.listSize}`, data, {
                        headers: { "Content-Type": "application/json" },
                    });
                    await fetchAllData(); 
                    closeFormModal();
                } catch (err) {
                    console.error("❌ Error during API call:", err);
                    alert("There was an error processing your file. Please check the console.");
                } finally {
                    setIsSubmitting(false);
                }
            };
            reader.readAsText(formData.metadataFile);
        } catch (error) {
            console.error("❌ Top-level error:", error);
            alert("An unexpected error occurred. Please check the console.");
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (groupToDelete) {
            try {
                await axios.delete(`${API_BASE_URL}/deleteGroup/${groupToDelete}`);
                await fetchAllData();
                closeDeleteModal();
            } catch (error) {
                console.error("❌ Error deleting group:", error);
                alert("Failed to delete the group. Make sure the backend endpoint is configured.");
            }
        }
    };

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
    }, [isFormModalOpen, isDeleteModalOpen, isDetailModalOpen, closeFormModal, closeDeleteModal, closeDetailModal]);

    // ✅ NEW: Conditional return for the initial loader
    if (isFirstVisitLoading) {
        return <CYNLoader/>;
    }

    return (
        <>
            {isSubmitting && <FullScreenLoader />}
            
            <div
                className="min-h-screen bg-black text-[#e0e0e0] relative overflow-hidden"
                style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    backgroundImage: "url('/Background[1].png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }} >
                <div className="relative z-10">
                    <header className="bg-black/60 backdrop-blur-lg border-b border-[#1a1a1a] sticky top-0">
                        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 hover:scale-110 transition-transform duration-300">
                                    <img 
                                        src="/logo.png" 
                                        alt="Logo" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-[#e0e0e0]">CYN</h1>
                                  
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
                            <StatCard icon={AlertTriangle} label="Suspicious Total" value={stats.suspiciousTotal} valueColor="text-[#ff1744]" borderColor="#ef4444" />
                            <StatCard icon={Users} label="Normal Total" value={stats.normalTotal} valueColor="text-[#00ff41]" borderColor="#00ff41" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {groups.map((group, index) => (<GroupCard key={group.name} group={group} index={index} onDelete={openDeleteModal} onViewDetails={openDetailModal} />))}
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
                <div className="fixed bottom-8 right-8 z-30 flex items-center gap-4">
                    <Link href={`/telegramBot`} >
                        <button onClick={() => console.log("Bot Analysis Clicked")} className="group bg-gradient-to-r from-[#00A8FF] to-[#007BFF] text-white font-bold py-4 px-6 rounded-2xl shadow-2xl shadow-[#00A8FF]/30 transition-all duration-300 transform hover:scale-105 hover:shadow-[#00A8FF]/50 flex items-center space-x-3">
                            <Bot className="w-6 h-6 group-hover:animate-pulse" />
                            <span>CYN_BOT_ANALYSIS</span>
                        </button>
                    </Link>
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
                        <div>
                            <label htmlFor="listSize" className="block text-sm font-semibold text-[#00ff41] mb-2">SUSPICIOUS USER COUNT</label>
                            <input
                                type="number"
                                id="listSize"
                                name="listSize"
                                value={formData.listSize}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="w-full bg-black/50 border-2 border-[#1a1a1a] rounded-xl px-4 py-3 text-[#e0e0e0] focus:outline-none focus:border-[#00ff41] transition-colors"
                                placeholder="e.g., 10"
                            />
                        </div>
                        <div className="flex justify-end pt-2 space-x-4">
                            <button type="button" onClick={closeFormModal} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#888888] font-semibold py-3 px-6 rounded-xl transition-all">CANCEL</button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-[#00ff41] to-[#4caf50] text-black font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#00ff41]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                EXECUTE
                            </button>
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

                <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal}>
                    {selectedGroup && (
                        <div>
                            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[#ff1744] flex items-center"><ListChecks className="w-6 h-6 mr-3" />SUSPICIOUS_USER_LOG</h2>
                                <button onClick={closeDetailModal} className="text-[#666666] hover:text-[#ff1744] p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                <p className="text-sm text-[#888888] mb-4">Detailed analysis for group: <span className="text-[#00ff41] font-semibold">{selectedGroup.name}</span></p>
                                {selectedGroup.suspiciousUserDetails && selectedGroup.suspiciousUserDetails.length > 0 ? (
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b border-[#333333] text-[#888888]">
                                            <tr>
                                                <th className="p-3">RANK</th>
                                                <th className="p-3">USER_ID</th>
                                                <th className="p-3">LAST KNOWN IP</th>
                                                <th className="p-3">DEVICE</th>
                                                <th className="p-3">LAST ONLINE</th>
                                                <th className="p-3 text-center">FLAGS</th>
                                                <th className="p-3 text-right">PROBABILITY</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedGroup.suspiciousUserDetails.map((user) => (
                                                <tr key={user.user_id} className="border-b border-[#1a1a1a] hover:bg-white/5">
                                                    <td className="p-3 font-bold text-white">{user.rank}</td>
                                                    <td className="p-3 text-white font-mono">{user.user_id}</td>
                                                    <td className="p-3 text-neutral-400 font-mono">
                                                        <Link href={`/globe?ip=${user.last_known_ip}`} className="hover:text-[#00ff41] hover:underline transition-colors duration-200">
                                                            {user.last_known_ip}
                                                        </Link>
                                                    </td>
                                                    <td className="p-3 text-neutral-300 capitalize flex items-center gap-2">
                                                        {user.device && (user.device.toLowerCase() === 'android' || user.device.toLowerCase() === 'ios') ?
                                                            <Smartphone className="w-4 h-4 text-neutral-500" /> :
                                                            <Laptop className="w-4 h-4 text-neutral-500" />}
                                                        {user.device || 'NA'}
                                                    </td>
                                                    <td className="p-3 text-neutral-400 font-mono">{new Date(user.last_online).toLocaleString()}</td>
                                                    <td className="p-3 text-center text-[#ff1744]">{user.flags}</td>
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