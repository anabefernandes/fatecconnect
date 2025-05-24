import React, { useRef, useState, useEffect } from 'react';
import { Input, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';
import style from './Chat.module.css';

export default function Chat({ socket, user }) {
  const bottomRef = useRef();
  const messageRef = useRef();
  const [messageList, setMessageList] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join_chat', {
      nome: user.nome,
      papel: user.papel,
    });

    const audioNotification = new Audio('/sounds/notificacao.mp3');

    const handleReceiveMessage = (data) => {
      setMessageList((current) => [...current, data]);
      audioNotification.play();
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, user]);

  useEffect(() => {
    scrollDown();
  }, [messageList]);

  const handleSubmit = () => {
    const message = messageRef.current.value;
    if (!message.trim()) return;

    const messageData = {
      userId: socket.id,
      username: user.nome || 'Usuário',
      message: message.trim(),
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

  return (
    <div className={style['chat-wrapper']}>
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

      {open && (
        <div className={style['chat-container']}>
          <div className={style['chat-body']}>
            {messageList.map((message, index) => {
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
            })}
            <div ref={bottomRef} />
          </div>

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

          {showEmojiPicker && (
            <div className={style['emoji-picker']}>
              <Picker data={emojiData} onEmojiSelect={addEmoji} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
