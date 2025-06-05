import React, { useRef, useState, useEffect } from 'react';
import { Input, IconButton, Button, List, ListItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import CloseIcon from '@mui/icons-material/Close';
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';
import style from './Chat.module.css';

export default function Chat({ socket, user }) {
  const bottomRef = useRef();
  const messageRef = useRef();
  const [messageList, setMessageList] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [open, setOpen] = useState(false); // Controla a visibilidade do chat principal
  const [monitoresDisponiveis, setMonitoresDisponiveis] = useState([]);
  const [currentChatRoomId, setCurrentChatRoomId] = useState(null);
  const [chatPartnerName, setChatPartnerName] = useState('');
  const [pendingChatRequest, setPendingChatRequest] = useState(null); // Controla a visibilidade do Dialog de solicitação
  const [activePrivateChats, setActivePrivateChats] = useState(new Map());
  const [selectedMonitorId, setSelectedMonitorId] = useState(null); // Monitor que o aluno selecionou para chat

  useEffect(() => {
    if (!socket || !user) {
      console.error("Socket ou user não definidos no Chat component.");
      return;
    }

    console.log("✅ Chat component mounted with socket and user:", user.nome, user.papel);

    socket.emit('join_chat', {
      userId: user._id,
      nome: user.nome,
      papel: user.papel,
    });

    const audioNotification = new Audio('/sounds/notificacaoChat.mp3');

    const handleReceiveMessage = (data) => {
      setMessageList((current) => [...current, data]);
      audioNotification.play();
    };

    const handleMonitoresOnline = (lista) => {
      console.log("Received monitores_online:", lista);
      // Filtra apenas monitores que estão "disponíveis" (você pode definir essa lógica no backend)
      setMonitoresDisponiveis(lista.filter(m => m.isAvailable));
    };

    const handlePrivateChatRequested = (data) => {
      if (user.papel === 'monitor') {
        console.log("Solicitação de chat recebida:", data);
        setPendingChatRequest(data);
      }
    };

    const handleChatRoomReady = ({ roomId }) => {
      console.log(`Sala de chat ${roomId} pronta para uso!`);
      // Não é estritamente necessário setar o roomId aqui, pois 'private_chat_initiated' já o faz.
    };

    const handlePrivateChatInitiated = ({ roomId, partnerName }) => {
      setCurrentChatRoomId(roomId);
      setChatPartnerName(partnerName);
      setMessageList([]); // Limpa as mensagens ao iniciar um novo chat
      setOpen(true); // Abre o chat principal
      setPendingChatRequest(null); // Limpa qualquer solicitação pendente
      setSelectedMonitorId(null); // Limpa o monitor selecionado pelo aluno

      if (user.papel === 'monitor') {
        setActivePrivateChats((prev) => {
          const newMap = new Map(prev);
          if (!newMap.has(roomId)) {
            newMap.set(roomId, { studentName: partnerName, roomId: roomId });
          }
          return newMap;
        });
      }
    };

    const handleChatEnded = (message) => {
      alert(message);
      // Se o chat que terminou é o chat atual, limpe tudo
      if (currentChatRoomId) {
        setCurrentChatRoomId(null);
        setChatPartnerName('');
        setMessageList([]);
      }
      setPendingChatRequest(null); // Garante que a solicitação pendente seja limpa

      if (user.papel === 'monitor') {
        setActivePrivateChats((prev) => {
          const newMap = new Map(prev);
          // Remove o chat da lista de ativos do monitor
          if (newMap.has(currentChatRoomId)) {
            newMap.delete(currentChatRoomId);
          }
          return newMap;
        });
      }
      // Não necessariamente fecha o chat principal, mas volta para a tela inicial
      // onde o usuário pode selecionar outro monitor/chat.
      // Se desejar fechar, mude para: setOpen(false);
    };

    const handleConnectionError = (error) => {
      console.error("Erro de conexão:", error);
      alert(`Erro de conexão: ${error}`);
    };

    const handleMessageError = (error) => {
      console.error("Erro na mensagem:", error);
      alert(`Erro na mensagem: ${error}`);
    };

    const handleChatError = (error) => {
      console.error("Erro no chat:", error);
      alert(`Erro no chat: ${error}`);
    };

    // Listeners para eventos do socket
    socket.on('receive_message', handleReceiveMessage);
    socket.on('monitores_online', handleMonitoresOnline);
    socket.on('private_chat_requested', handlePrivateChatRequested);
    socket.on('chat_room_ready', handleChatRoomReady);
    socket.on('private_chat_initiated', handlePrivateChatInitiated);
    socket.on('chat_ended', handleChatEnded);
    socket.on('connection_error', handleConnectionError);
    socket.on('message_error', handleMessageError);
    socket.on('chat_error', handleChatError);

    // Cleanup: Remove listeners ao desmontar o componente
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('monitores_online', handleMonitoresOnline);
      socket.off('private_chat_requested', handlePrivateChatRequested);
      socket.off('chat_room_ready', handleChatRoomReady);
      socket.off('private_chat_initiated', handlePrivateChatInitiated);
      socket.off('chat_ended', handleChatEnded);
      socket.off('connection_error', handleConnectionError);
      socket.off('message_error', handleMessageError);
      socket.off('chat_error', handleChatError);
    };
  }, [socket, user, currentChatRoomId]); // Adicionado currentChatRoomId às dependências

  useEffect(() => {
    scrollDown();
  }, [messageList, open]); // Incluído 'open' para scrollar quando o chat é aberto

  const handleSubmit = () => {
    const message = messageRef.current.value;
    if (!message.trim() || !currentChatRoomId) return;

    const messageData = {
      userId: socket.id,
      username: user.nome || 'Usuário',
      message: message.trim(),
      roomId: currentChatRoomId,
    };

    socket.emit('send_message', messageData);
    clearInput();
    focusInput();
    setShowEmojiPicker(false);
  };

  const clearInput = () => {
    messageRef.current.value = '';
  };

  const focusInput = () => {
    messageRef.current.focus();
  };

  const getEnterKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const scrollDown = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addEmoji = (emoji) => {
    if (!messageRef.current) return;
    const input = messageRef.current;
    const start = input.value.substring(0, input.selectionStart);
    const end = input.value.substring(input.selectionEnd);
    const text = start + emoji.native + end;
    input.value = text;
    input.focus();
  };

  // Função para aluno solicitar chat com um monitor
  const requestChatWithMonitor = (monitorId) => {
    setSelectedMonitorId(monitorId); // Marca o monitor como "selecionado"
    socket.emit('request_private_chat', monitorId);
  };

  // Função para monitor aceitar uma solicitação de chat
  const acceptChatRequest = () => {
    if (pendingChatRequest) {
      socket.emit('accept_private_chat', {
        studentId: pendingChatRequest.studentId,
        roomId: pendingChatRequest.roomId,
      });
      setPendingChatRequest(null); // Limpa a solicitação pendente
    }
  };

  // Função para monitor rejeitar uma solicitação de chat
  const rejectChatRequest = () => {
    if (pendingChatRequest) {
      socket.emit('reject_private_chat', {
        studentId: pendingChatRequest.studentId,
        roomId: pendingChatRequest.roomId,
      });
    }
    setPendingChatRequest(null);
    alert("Solicitação de chat rejeitada.");
  };

  // Função para encerrar o chat atual
  const endCurrentChat = () => {
    if (currentChatRoomId) {
      socket.emit('end_private_chat', currentChatRoomId);
      setCurrentChatRoomId(null);
      setChatPartnerName('');
      setMessageList([]);
    }
    setOpen(false); // Fecha o chat principal ao encerrar a conversa
  };

  // Função para monitor selecionar um chat ativo para visualizar
  const selectActiveChat = (roomId, studentName) => {
    setCurrentChatRoomId(roomId);
    setChatPartnerName(studentName);
    setMessageList([]); // Limpa as mensagens antigas para carregar as novas (se houver histórico)
    setOpen(true); // Abre o chat principal ao selecionar um chat ativo
    // TODO: No futuro, você pode querer carregar o histórico de mensagens para este roomId
  };

  return (
    <div className={style['chat-wrapper']}>
      {/* Botão para abrir/fechar o painel de chat principal */}
      <IconButton
        onClick={() => setOpen(!open)}
        className={style['toggle-button']}
        aria-label={open ? 'Fechar chat' : 'Abrir chat'}
      >
        <img
          src="/images/chat.png"
          alt="Chat"
          style={{ width: 40, height: 40 }}
        />
      </IconButton>

      {/* Painel de chat principal, condicionado por 'open' */}
      {open && (
        <div className={style['chat-container']}>
          <div className={style['chat-header']}>
            {currentChatRoomId ? (
              <>
                <span>
                  <span className={style['online-indicator']}></span>
                  <strong>{chatPartnerName}</strong>
                </span>
                <IconButton onClick={endCurrentChat} size="small" style={{ marginLeft: 'auto', color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </>
            ) : (
              <span>
                {user.papel === 'aluno' ? 'Selecione um monitor' : 'Selecione um chat ativo'}
              </span>
            )}
          </div>

          <div className={style['chat-body']}>
            {/* Conteúdo do chat ou listas de seleção */}
            {currentChatRoomId ? (
              // Exibe as mensagens se houver um chat ativo
              messageList.map((message, index) => {
                const isMine = message.userId === socket.id;
                return (
                  <div
                    key={index}
                    className={`${style['message-container']} ${isMine ? style['message-mine'] : style['message-other']}`}
                  >
                    <div className={style['message-author']}>
                      <strong>{message.username}</strong>
                    </div>
                    <div className={style['message-text']}>{message.message}</div>
                  </div>
                );
              })
            ) : (
              // Exibe lista de monitores (para alunos) ou chats ativos (para monitores)
              user.papel === 'aluno' ? (
                // Aluno: lista de monitores disponíveis
                monitoresDisponiveis.length > 0 ? (
                  <div>
                    <p>Monitores disponíveis:</p>
                    <List>
                      {monitoresDisponiveis.map((monitor) => (
                        <ListItem key={monitor.id} disablePadding>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => requestChatWithMonitor(monitor.id)}
                            disabled={selectedMonitorId === monitor.id} // Desabilita o botão se já estiver solicitando
                            style={{
                              marginBottom: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              gap: '8px',
                              backgroundColor: '#fdf0f0', // cor de fundo suave
                              color: 'var(--red-dark)',
                              borderColor: 'var(--red-dark)',
                              fontWeight: 'bold'
                            }}
                          >
                            <span className={style['online-indicator']}></span>
                            <span>
                              {monitor.nome}
                              {monitor.curso ? ` (${monitor.curso})` : ''}
                              {selectedMonitorId === monitor.id && ' (Solicitando...)'}
                            </span>
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </div>
                ) : (
                  <p style={{
                    color: '#999',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginTop: '20px',
                    fontSize: '1rem'
                  }}>
                    Nenhum monitor está disponível agora.
                    Tente novamente em mais tarde! 🙁
                  </p>
                )
              ) : (
                // Monitor: lista de chats ativos
                activePrivateChats.size > 0 ? (
                  <div>
                    <p>Chats Ativos:</p>
                    <List>
                      {Array.from(activePrivateChats.entries()).map(([roomId, chatInfo]) => (
                        <ListItem key={roomId} disablePadding>
                          <Button
                            fullWidth
                            variant={currentChatRoomId === roomId ? "contained" : "outlined"}
                            onClick={() => selectActiveChat(roomId, chatInfo.studentName)}
                            style={{
                              marginBottom: '5px',
                            }}
                          >
                            {chatInfo.studentName}
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </div>
                ) : (
                  <p style={{
                    color: '#999',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginTop: '20px',
                    fontSize: '1rem',
                    userSelect: 'none'
                  }}>
                    💬 Nenhum chat privado ativo no momento. Aguardando solicitações...
                  </p>
                )
              )
            )}
            <div ref={bottomRef} />
          </div>

          {/* Área de input de mensagem - só aparece se houver um chat ativo */}
          {currentChatRoomId && (
            <div className={style['chat-footer']}>
              <Input
                inputRef={messageRef}
                placeholder="Mensagem"
                onKeyDown={getEnterKey}
                fullWidth
              />
              <InsertEmoticonIcon
                className={style['emoji-button']}
                sx={{ m: 1, cursor: 'pointer' }}
                onClick={() => setShowEmojiPicker((v) => !v)}
              />
              <SendIcon
                className={style['send-button']}
                sx={{ m: 1, cursor: 'pointer' }}
                onClick={handleSubmit}
              />
            </div>
          )}

          {showEmojiPicker && (
            <div className={style['emoji-picker']}>
              <Picker data={emojiData} onEmojiSelect={addEmoji} />
            </div>
          )}
        </div>
      )}

      {/* DIALOG DE NOVA SOLICITAÇÃO DE CHAT - APENAS PARA MONITORES */}
      <Dialog open={!!pendingChatRequest} onClose={rejectChatRequest}>
        <DialogTitle>Nova Solicitação de Chat</DialogTitle>
        <DialogContent>
          {pendingChatRequest && (
            <p>O aluno <strong>{pendingChatRequest.studentName}</strong> deseja iniciar um chat privado com você.</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={rejectChatRequest} className={style['reject-button']}>Rejeitar</Button>
          <Button onClick={acceptChatRequest} autoFocus className={style['accept-button']}>Aceitar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}