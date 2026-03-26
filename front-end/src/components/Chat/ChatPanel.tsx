import React, { useState } from 'react'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
const ChatPanel = () => {
    const [message, setMessage] = useState("");
    return (
        <div className='flex flex-col h-full'>
            <header className='border border-amber-50 flex shadow-sm w-full items-center justify-between'>
                <div className='flex m-3 items-center'>
                    <button
                        className='cursor-pointer'
                        title='backSpace'>
                        <KeyboardBackspaceIcon
                            fontSize='small'
                        />
                    </button>
                    <img
                        src="https://randomuser.me/api/portraits/women/32.jpg"
                        alt="Sarah Chen"
                        className='rounded-full w-12 h-12 mx-3' />
                    <div className=''>
                        <h3 className='font-semibold'>Con gà cục tác lá chanh</h3>
                        <p className='font-light'>Online hoặc Offline</p>
                    </div>
                </div>
                <div className='items-end mr-7 flex gap-3 cursor-pointer'>
                    <InfoOutlineIcon />
                </div>
            </header>
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50'>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl'>
                    <p className=''>Xin chào anh em sẽ gửi anh thông tin sớm nhất </p>
                    <p className='text-sm text-gray-500'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl bg-[#00A3A3] text-white ml-auto' >
                    <p className=''> Oke em em gui cho anh thông tin lẹ lẹ</p>
                    <p className='text-sm text-gray-200'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl'>
                    <p className=''>Dạ đây là thông tin của anh đây ạ</p>
                    <p className='text-sm text-gray-500'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl bg-[#00A3A3] text-white ml-auto'>
                    <p className=''>Đâu thông tin của anh đâu</p>
                    <p className='text-sm text-gray-200'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl'>
                    <p className=''>Xin chào anh em sẽ gửi anh thông tin sớm nhất </p>
                    <p className='text-sm text-gray-500'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl bg-[#00A3A3] text-white ml-auto' >
                    <p className=''> Oke em em gui cho anh thông tin lẹ lẹ</p>
                    <p className='text-sm text-gray-200'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl'>
                    <p className=''>Dạ đây là thông tin của anh đây ạ</p>
                    <p className='text-sm text-gray-500'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl bg-[#00A3A3] text-white ml-auto'>
                    <p className=''>Đâu thông tin của anh đâu</p>
                    <p className='text-sm text-gray-200'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl'>
                    <p className=''>Xin chào anh em sẽ gửi anh thông tin sớm nhất </p>
                    <p className='text-sm text-gray-500'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl bg-[#00A3A3] text-white ml-auto' >
                    <p className=''> Oke em em gui cho anh thông tin lẹ lẹ</p>
                    <p className='text-sm text-gray-200'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl'>
                    <p className=''>Dạ đây là thông tin của anh đây ạ</p>
                    <p className='text-sm text-gray-500'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl bg-[#00A3A3] text-white ml-auto'>
                    <p className=''>Đâu thông tin của anh đâu</p>
                    <p className='text-sm text-gray-200'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl'>
                    <p className=''>Xin chào anh em sẽ gửi anh thông tin sớm nhất </p>
                    <p className='text-sm text-gray-500'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl bg-[#00A3A3] text-white ml-auto' >
                    <p className=''> Oke em em gui cho anh thông tin lẹ lẹ</p>
                    <p className='text-sm text-gray-200'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl'>
                    <p className=''>Dạ đây là thông tin của anh đây ạ</p>
                    <p className='text-sm text-gray-500'>2:00 pm</p>
                </div>
                <div className='w-3/7 p-3 items-center border border-gray-300 m-4 rounded-xl bg-[#00A3A3] text-white ml-auto'>
                    <p className=''>Đâu thông tin của anh đâu</p>
                    <p className='text-sm text-gray-200'>2:00 pm</p>
                </div>
            </div>
            <div className='flex items-center gap-2 p-3 bg-white'>
                <button
                    title='sendFile'
                    className='p-2 w-10 h-10 bg-gray-200 rounded-full mr-2 hover:bg-gray-400 cursor-pointer'
                >
                    <AttachFileIcon />
                </button>
                <button
                    title='sendImage'
                    className='p-2 w-10 h-10 bg-gray-200 rounded-full mr-2 hover:bg-gray-400 cursor-pointer'
                >
                    <AddPhotoAlternateIcon />
                </button>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={1}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 resize-none h-auto max-h-32 px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-0 overflow-hidden"
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                />
                <button
                    title='sendChat'
                    className='p-2 w-10 h-10 bg-gray-200 rounded-full m-2 hover:bg-gray-400 cursor-pointer'
                >
                    <SendIcon
                        fontSize='small'
                    />
                </button>
            </div>
        </div>
    )
}

export default ChatPanel;
