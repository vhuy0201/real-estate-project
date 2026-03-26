import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Fab,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    Fade,
    Slide,
    CircularProgress,
    Card,
    CardMedia,
    CardContent,
    Button,
    Chip,
} from "@mui/material";
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Send as SendIcon,
    Person as PersonIcon,
    Bed as BedIcon,
    Bathtub as BathtubIcon,
    SquareFoot as AreaIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import { chatService } from "../../services/chatService";
import type { ChatMessage, Property } from "../../types/ChatBot";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    const currentLang = i18n.language as "vi" | "en";

    // Load messages from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("chatbot_messages");
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages);
                // Convert timestamp strings back to Date objects
                const messagesWithDates = parsedMessages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp),
                }));
                setMessages(messagesWithDates);
            } catch (error) {
                console.error("Error loading chat history:", error);
            }
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("chatbot_messages", JSON.stringify(messages));
        }
    }, [messages]);

    // Add welcome message if no messages exist
    useEffect(() => {
        if (messages.length === 0) {
            const welcomeMessage: ChatMessage = {
                id: "welcome",
                sender: "bot",
                text: currentLang === "vi"
                    ? "Xin chào! 👋 Tôi là trợ lý bất động sản thông minh. Tôi có thể giúp bạn tìm kiếm bất động sản phù hợp. Hãy cho tôi biết bạn đang tìm kiếm gì nhé!"
                    : "Hello! 👋 I'm a smart real estate assistant. I can help you find suitable properties. Tell me what you're looking for!",
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    }, [currentLang]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleClearHistory = () => {
        if (window.confirm(currentLang === "vi" ? "Bạn có chắc muốn xóa toàn bộ lịch sử chat?" : "Are you sure you want to clear all chat history?")) {
            localStorage.removeItem("chatbot_messages");
            const welcomeMessage: ChatMessage = {
                id: "welcome-" + Date.now(),
                sender: "bot",
                text: currentLang === "vi"
                    ? "Xin chào! 👋 Tôi là trợ lý bất động sản thông minh. Tôi có thể giúp bạn tìm kiếm bất động sản phù hợp. Hãy cho tôi biết bạn đang tìm kiếm gì nhé!"
                    : "Hello! 👋 I'm a smart real estate assistant. I can help you find suitable properties. Tell me what you're looking for!",
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            const response = await chatService.sendMessage(inputMessage);

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: response.message,
                timestamp: new Date(),
                properties: response.data.properties,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error: any) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: currentLang === "vi"
                    ? "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau."
                    : "Sorry, an error occurred. Please try again later.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleViewProperty = (propertyId: string) => {
        navigate(`/property/detail/${propertyId}`);
        setIsOpen(false);
    };

    const scrollCarousel = (messageId: string, direction: "left" | "right") => {
        const carousel = carouselRefs.current[messageId];
        if (carousel) {
            const scrollAmount = 274; // Width of card
            const newScrollLeft =
                direction === "left"
                    ? carousel.scrollLeft - scrollAmount
                    : carousel.scrollLeft + scrollAmount;
            carousel.scrollTo({ left: newScrollLeft, behavior: "smooth" });
        }
    };

    const renderPropertyCard = (property: Property) => (
        <Card
            key={property._id}
            sx={{
                minWidth: 280,
                maxWidth: 280,
                flexShrink: 0,
                scrollSnapAlign: "start",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                },
            }}
            onClick={() => handleViewProperty(property._id)}
        >
            <CardMedia
                component="img"
                height="150"
                image={property.images[0] || "/placeholder.jpg"}
                alt={property.title[currentLang]}
                sx={{ objectFit: "cover" }}
            />
            <CardContent sx={{ p: 1.5 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        mb: 0.75,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "2.7rem",
                    }}
                >
                    {property.title[currentLang]}
                </Typography>

                <Typography
                    variant="body2"
                    color="error"
                    sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.75 }}
                >
                    {formatPrice(property.price)}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 0.75,
                        fontSize: "0.8rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    📍 {property.address[currentLang]}
                </Typography>

                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 0.75 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <BedIcon sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {property.bedrooms}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <BathtubIcon sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {property.bathrooms}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AreaIcon sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {property.area} {property.unit}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
                    {property.features.slice(0, 2).map((feature) => (
                        <Chip
                            key={feature._id}
                            label={feature.feature_name[currentLang]}
                            size="small"
                            sx={{ fontSize: "0.65rem", height: "20px" }}
                        />
                    ))}
                    {property.features.length > 2 && (
                        <Chip
                            label={`+${property.features.length - 2}`}
                            size="small"
                            sx={{ fontSize: "0.65rem", height: "20px" }}
                        />
                    )}
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    sx={{ fontSize: "0.8rem", py: 0.5 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewProperty(property._id);
                    }}
                >
                    {currentLang === "vi" ? "Xem chi tiết" : "View Details"}
                </Button>
            </CardContent>
        </Card>
    );

    const renderPropertyCarousel = (properties: Property[], messageId: string) => (
        <Box sx={{ position: "relative", mt: 2 }}>
            {/* Navigation Buttons */}
            {properties.length > 1 && (
                <>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            scrollCarousel(messageId, "left");
                        }}
                        sx={{
                            position: "absolute",
                            left: 4,
                            top: "40%",
                            transform: "translateY(-50%)",
                            zIndex: 2,
                            bgcolor: "rgba(255,255,255,0.95)",
                            boxShadow: 3,
                            "&:hover": {
                                bgcolor: "white",
                                boxShadow: 4,
                            },
                            width: 32,
                            height: 32,
                        }}
                    >
                        <ChevronLeftIcon sx={{ fontSize: "1.2rem" }} />
                    </IconButton>

                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            scrollCarousel(messageId, "right");
                        }}
                        sx={{
                            position: "absolute",
                            right: 4,
                            top: "40%",
                            transform: "translateY(-50%)",
                            zIndex: 2,
                            bgcolor: "rgba(255,255,255,0.95)",
                            boxShadow: 3,
                            "&:hover": {
                                bgcolor: "white",
                                boxShadow: 4,
                            },
                            width: 32,
                            height: 32,
                        }}
                    >
                        <ChevronRightIcon sx={{ fontSize: "1.2rem" }} />
                    </IconButton>
                </>
            )}

            {/* Carousel Container */}
            <Box
                ref={(el) => {
                    carouselRefs.current[messageId] = el as HTMLDivElement | null;
                }}
                sx={{
                    display: "flex",
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    scrollSnapType: "x mandatory",
                    pb: 1,
                    "&::-webkit-scrollbar": {
                        height: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "grey.200",
                        borderRadius: "3px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "grey.400",
                        borderRadius: "3px",
                        "&:hover": {
                            backgroundColor: "grey.500",
                        },
                    },
                }}
            >
                {properties.map((property) => renderPropertyCard(property))}
            </Box>

            {/* Property Count Indicator */}
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    display: "block",
                    textAlign: "center",
                    mt: 1,
                }}
            >
                {properties.length}{" "}
                {currentLang === "vi"
                    ? properties.length === 1
                        ? "bất động sản"
                        : "bất động sản"
                    : properties.length === 1
                        ? "property"
                        : "properties"}
            </Typography>
        </Box>
    );

    const renderMessage = (message: ChatMessage) => {
        const isBot = message.sender === "bot";

        return (
            <Box
                key={message.id}
                sx={{
                    display: "flex",
                    justifyContent: isBot ? "flex-start" : "flex-end",
                    mb: 1.5,
                    alignItems: "flex-start",
                    gap: 0.75,
                }}
            >
                {isBot && (
                    <Avatar
                        src="/chat-bot.png"
                        alt="Chatbot"
                        sx={{
                            bgcolor: "white",
                            width: 28,
                            height: 28,
                        }}
                    />
                )}

                <Box sx={{ maxWidth: "80%" }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            bgcolor: isBot ? "#f0f0f0" : "#17a2b8",
                            color: isBot ? "#000000" : "#ffffff",
                            borderRadius: 3,
                            borderTopLeftRadius: isBot ? 0 : 3,
                            borderTopRightRadius: isBot ? 3 : 0,
                            boxShadow: "none",
                        }}
                    >
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                            {message.text}
                        </Typography>
                    </Paper>

                    {message.properties && message.properties.length > 0 &&
                        renderPropertyCarousel(message.properties, message.id)
                    }

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: "block",
                            mt: 0.5,
                            ml: isBot ? 0 : "auto",
                            textAlign: isBot ? "left" : "right",
                            fontSize: "0.7rem",
                        }}
                    >
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Typography>
                </Box>

                {!isBot && (
                    <Avatar
                        sx={{
                            bgcolor: "secondary.main",
                            width: 28,
                            height: 28,
                        }}
                    >
                        <PersonIcon sx={{ fontSize: "1rem" }} />
                    </Avatar>
                )}
            </Box>
        );
    };

    return (
        <>
            {/* Chat Window */}
            <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
                <Paper 
                    elevation={8}
                    sx={{
                        position: "fixed",
                        bottom: { xs: 0, sm: 30 },
                        right: { xs: 0, sm: 16 },
                        width: { xs: "100%", sm: 340, md: 380 },
                        height: { xs: "calc(100vh - 60px)", sm: 460, md: 500 },
                        maxHeight: { xs: "calc(100vh - 60px)", sm: "calc(100vh - 90px)" },
                        borderRadius: { xs: 0, sm: 2 },
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 1300,
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            p: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar
                                src="/chat-bot.png"
                                alt="Chatbot"
                                sx={{
                                    bgcolor: "white",
                                    width: 36,
                                    height: 36,
                                }}
                            />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                    {currentLang === "vi" ? "Trợ lý AI" : "AI Assistant"}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.7rem" }}>
                                    {currentLang === "vi" ? "Luôn sẵn sàng hỗ trợ" : "Always ready to help"}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                                onClick={handleClearHistory}
                                sx={{
                                    color: "white",
                                    "&:hover": {
                                        bgcolor: "rgba(255,255,255,0.1)",
                                    },
                                }}
                                size="small"
                                title={currentLang === "vi" ? "Xóa lịch sử" : "Clear history"}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={handleToggleChat}
                                sx={{
                                    color: "white",
                                    "&:hover": {
                                        bgcolor: "rgba(255,255,255,0.1)",
                                    },
                                }}
                                size="small"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages Area */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            p: 1.5,
                            bgcolor: "grey.50",
                            "&::-webkit-scrollbar": {
                                width: "6px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "rgba(0,0,0,0.2)",
                                borderRadius: "3px",
                            },
                        }}
                    >
                        {messages.map((message) => renderMessage(message))}
                        {isLoading && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Avatar
                                    src="/chat-bot.png"
                                    alt="Chatbot"
                                    sx={{
                                        bgcolor: "white",
                                        width: 28,
                                        height: 28,
                                    }}
                                />
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.25,
                                        bgcolor: "#f0f0f0",
                                        borderRadius: 3,
                                        borderTopLeftRadius: 0,
                                        boxShadow: "none",
                                    }}
                                >
                                    <CircularProgress size={18} />
                                </Paper>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input Area */}
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: "white",
                            borderTop: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Box sx={{ display: "flex", gap: 0.75 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={
                                    currentLang === "vi"
                                        ? "Nhập câu hỏi của bạn..."
                                        : "Type your question..."
                                }
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                multiline
                                maxRows={2}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 3,
                                        fontSize: "0.875rem",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        py: 1,
                                    },
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    width: 36,
                                    height: 36,
                                    "&:hover": {
                                        bgcolor: "primary.dark",
                                    },
                                    "&:disabled": {
                                        bgcolor: "grey.300",
                                    },
                                }}
                            >
                                <SendIcon sx={{ fontSize: "1.1rem" }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Paper>
            </Slide>

            {/* Floating Action Button */}
            <Fade in={!isOpen}>
                <Fab
                    color="primary"
                    aria-label="chat"
                    onClick={handleToggleChat}
                    sx={{
                        position: "fixed",
                        bottom: 16,
                        right: 16,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        width: { xs: 56, sm: 64 },
                        height: { xs: 56, sm: 64 },
                        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                        "&:hover": {
                            transform: "scale(1.1)",
                            boxShadow: "0 6px 30px rgba(102, 126, 234, 0.6)",
                        },
                        transition: "all 0.3s ease",
                    }}
                >
                    <ChatIcon sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }} />
                </Fab>
            </Fade>
        </>
    );
};

export default ChatBot;

