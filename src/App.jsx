import React, { useState, useEffect } from 'react';
import './styles.css';
import Sidebar from './components/Sidebar';
import ChatDirectory from './components/ChatDirectory';
import ChatCanvas from './components/ChatCanvas';
import Auth from './components/Auth';
import { Search, UserCheck } from 'lucide-react';
import GroupMembershipModal from './components/GroupMembershipModal';
import GroupCreationModal from './components/GroupCreationModal';
import InterestsScreen from './components/InterestsScreen';
import PollModal from './components/PollModal';


const API = import.meta.env.VITE_API_BASE_URL || 'https://cloudcomai.com/apiapp/api';
const groupTypes = ['Family Group', 'Friend Group', 'Fan Group', 'Study Group', 'College Group', 'Class Group', 'Department Group', 'Project Group', 'Club Group', 'Alumni Group', 'Workplace Group', 'Neighborhood Group', 'Event Group', 'Staff Group'];
const interests = ['Private Chats', 'Public Chat Rooms', ...groupTypes, 'Communities', 'Local Groups', 'Jobs and Internships', 'Business and Finance', 'Technology', 'Sports', 'Music', 'Movies', 'Education', 'Gaming', 'Travel', 'Career Guidance'];

async function api(path, options = {}) {
    const token = localStorage.getItem('cc_token');
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
}

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [screen, setScreen] = useState(localStorage.getItem('cc_token') ? 'app' : 'login');
    const [token, setToken] = useState(localStorage.getItem('cc_token') || '');
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('cc_user') || 'null'));
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [composer, setComposer] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [editing, setEditing] = useState(null);
    const [modal, setModal] = useState(null);
    const [chatFilter, setChatFilter] = useState('all');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('chats'); 
    
    const [topInterests, setTopInterests] = useState(['Private Chats', 'Family Group', 'Study Group', 'Technology']);

    const auth = (u, t) => {
        setUser(u); setToken(t);
        localStorage.setItem('cc_user', JSON.stringify(u));
        localStorage.setItem('cc_token', t);
        setScreen('app');
    };

    const logout = () => {
        localStorage.clear(); setToken(''); setUser(null);
        setSelectedChat(null); setChats([]); setMessages([]);
        setScreen('login');
    };

    // Pull Active Panel Streams
    useEffect(() => {
        if (!token || screen !== 'app') return;
        
        let fetchPath = '/chats.php';
        if (activeTab === 'groups') fetchPath = '/chats.php?type=group'; 
        if (activeTab === 'people') fetchPath = '/users_list.php';      
        
        setChats([]); 
        
        api(fetchPath, { method: 'GET' })
          .then(data => {
            if (data.chats) {
              setChats(data.chats);
              if (data.chats.length > 0 && !selectedChat) {
                setSelectedChat(data.chats[0]);
              }
            } else if (data.users) {
              const mappedUsersAsChats = data.users.map(u => ({
                id: u.id,
                name: u.name,
                preview: `@${u.user_id} - Click to start chat`,
                time: '',
                unread: 0,
                isContact: true 
              }));
              setChats(mappedUsersAsChats);
            }
          })
          .catch(err => console.error("Error updating active row streams:", err));
    }, [token, screen, activeTab]); 

    // Pull Message Histories
    useEffect(() => {
        if (!token || !selectedChat || screen !== 'app' || selectedChat.isContact) return;
        api(`/messages.php?chat_id=${selectedChat.id}`, { method: 'GET' })
            .then(data => { if (data.messages) setMessages(data.messages); })
            .catch(err => console.error(err));
    }, [selectedChat, token, screen]);
    

    const handleSendMessage = async () => {
        if (!composer.trim() || !selectedChat) return;
        const payload = {
            chat_id: selectedChat.id, body: composer,
            reply_to_message_id: replyTo ? replyTo.id : null,
            editing_id: editing ? editing.id : null
        };
        try {
            const targetEndpoint = editing ? '/edit_message.php' : '/messages.php';
            const result = await api(targetEndpoint, { method: 'POST', body: JSON.stringify(payload) });
            if (editing) {
                setMessages(prev => prev.map(m => m.id === editing.id ? { ...m, body: composer, edited: true } : m));
                setEditing(null);
            } else if (result.message) {
                setMessages(prev => [...prev, result.message]);
            }
            setComposer(''); setReplyTo(null);
        } catch (err) { alert(err.message); }
    };

    const handleSelectConversationRow = async (selectedRowItem) => {
        if (!selectedRowItem) return;

        if (!selectedRowItem.isContact) {
            setSelectedChat(selectedRowItem);
            return;
        }

        try {
            const response = await api('/chats.php', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'private',
                    target_user_id: selectedRowItem.id
                })
            });

            if (response.chat) {
                setChats(prev => [response.chat, ...prev.filter(c => c.id !== response.chat.id)]);
                setSelectedChat(response.chat);
                setActiveTab('chats'); 
            }
        } catch (err) {
            alert(err.message || "Failed to establish a private channel link.");
        }
    };

    const filteredChats = chats.filter(c => {
        const chatName = c.name || '';
        const matchesSearch = chatName.toLowerCase().includes(searchQuery.toLowerCase());
        if (chatFilter === 'unread') return matchesSearch && c.unread > 0;
        return matchesSearch;
    });

    if (screen === 'login' || !token) {
        return <Auth onAuth={auth} />;
    }

    if (screen === 'interests') {
        return (
          <InterestsScreen 
            interests={interests} 
            topInterests={topInterests} 
            setTopInterests={setTopInterests} 
            saveAndContinue={() => setScreen('app')} 
          />
        );
    }

    return (
        <div className={`app-container ${isDarkMode ? 'dark-theme' : ''} ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <Sidebar 
            user={user} 
            setModal={setModal} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={logout} 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            setScreen={setScreen}
          />
          
          <ChatDirectory 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            chatFilter={chatFilter} 
            setChatFilter={setChatFilter} 
            filteredChats={filteredChats} 
            selectedChat={selectedChat} 
            setSelectedChat={handleSelectConversationRow} 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            setModal={setModal}
            activeTab={activeTab}
          />
          
          <ChatCanvas 
            selectedChat={selectedChat} 
            messages={messages} 
            user={user} 
            setModal={setModal} 
            replyTo={replyTo} 
            setReplyTo={setReplyTo} 
            editing={editing} 
            setEditing={setEditing} 
            composer={composer} 
            setComposer={setComposer} 
            onSendMessage={handleSendMessage} 
          />

          {modal && (
            <div className="modal-backdrop">
              {modal === 'add_member' || modal === 'manage_members' ? (
                <GroupMembershipModal type={modal} selectedChat={selectedChat} apiBridge={api} close={() => setModal(null)} onActionComplete={() => setModal(null)} />
              ) : modal === 'group' ? (
                <GroupCreationModal 
                  groupTypes={groupTypes} 
                  apiBridge={api} 
                  close={() => setModal(null)} 
                  onGroupCreated={(newChat) => {
                    setChats(prev => [newChat, ...prev]);
                    setSelectedChat(newChat);
                    setActiveTab('groups');
                  }} 
                />
              ): modal === 'poll' ? (
                /* 📊 INSERT REAL POLL LAYER COMPONENT */
                <PollModal 
                  selectedChat={selectedChat} 
                  apiBridge={api} 
                  close={() => setModal(null)} 
                  onPollCreated={(pollMessageObject) => {
                    // Instantly render the new poll message onto your active chat channel screen area
                    setMessages(prev => [...prev, pollMessageObject]);
                  }} 
                />
              ) : (
                <div className="modal-content-card">
                  <h3>Feature Panel ({modal.replace('_', ' ')})</h3>
                  <button className="primary" onClick={() => setModal(null)}>Dismiss</button>
                </div>
              )}
            </div>
          )}
        </div>
    );
}
