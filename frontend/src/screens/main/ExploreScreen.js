import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../context/ToastContext';
import { askRouteAI } from '../../api/aiApi';
import { cleanAIMarkdown } from '../../utils/textFormatter';

const STORAGE_KEY = '@mapenroute_explore_chat_v1';

// Prompt se origin aur destination extract karne ke liye helper
const extractRoutePoints = (text) => {
  if (!text) return null;
  const match = text.match(
    /(?:from\s+)?([a-zA-Z\s]+?)\s+(?:to|se)\s+([a-zA-Z\s]+?)(?:\s+(?:nice|best|cafes?|resturent|restaurants?|dhabas?|toll|road|via)|$)/i
  );
  if (match && match[1] && match[2]) {
    return {
      origin: match[1].trim(),
      destination: match[2].trim(),
    };
  }
  return null;
};

const ExploreScreen = ({ navigation }) => {
  const { showToast } = useToast();
  const [aiQuestion, setAiQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef(null);
  const typingTimerRef = useRef(null);

  // 1. Initial Load: Load chat history from AsyncStorage
  useEffect(() => {
    const loadStoredChat = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load explore chat history', e);
      }
    };
    loadStoredChat();
  }, []);

  // 2. Save chat history to AsyncStorage
  const saveChatHistory = async (newMessages) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch (e) {
      console.error('Failed to save explore chat', e);
    }
  };

  const clearChatHistory = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMessages([]);
      showToast('Chat history cleared', 'info');
    } catch (e) {
      showToast('Could not clear history', 'error');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  const handleAskAI = async () => {
    const query = aiQuestion.trim();
    if (!query) {
      showToast('Please type a travel query first.', 'error');
      return;
    }

    const routeData = extractRoutePoints(query);

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      routeData,
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    saveChatHistory(updatedWithUser);

    setAiQuestion('');
    setLoadingAI(true);
    setStreamingText('');
    scrollToBottom();

    try {
      const rawAnswer = await askRouteAI(query);
      const cleanAnswer = cleanAIMarkdown(rawAnswer);

      setLoadingAI(false);
      setIsTyping(true);
      const chars = cleanAnswer.split('');
      let index = 0;

      if (typingTimerRef.current) clearInterval(typingTimerRef.current);

      typingTimerRef.current = setInterval(() => {
        if (index < chars.length) {
          const chunk = chars.slice(index, index + 3).join('');
          setStreamingText((prev) => prev + chunk);
          index += 3;
          scrollToBottom();
        } else {
          clearInterval(typingTimerRef.current);
          setIsTyping(false);
          const finalMessages = [
            ...updatedWithUser,
            {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: cleanAnswer,
              routeData,
            },
          ];
          setMessages(finalMessages);
          saveChatHistory(finalMessages);
          setStreamingText('');
        }
      }, 15);
    } catch (err) {
      setLoadingAI(false);
      setIsTyping(false);
      showToast('Could not fetch AI insights right now.', 'error');
    }
  };

  const handlePlotOnMap = (routeData) => {
    if (!routeData) return;

    try {
      // BottomTabNavigator me screen ka exact registered name "Map" hai
      navigation.navigate('Map', {
        initialOrigin: routeData.origin,
        initialDestination: routeData.destination,
      });
      showToast(`Plotting ${routeData.origin} ➔ ${routeData.destination}`, 'success');
    } catch (err) {
      console.error('Navigation error:', err);
      showToast('Could not open map screen', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top Header with Clear Chat Action */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>MapEnroute AI Assistant</Text>
            <Text style={styles.subtitle}>Ask about any Indian highway, cafes & routes</Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={clearChatHistory} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToBottom}
      >
        {messages.length === 0 && !loadingAI && !isTyping ? (
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeIcon}>🛣️</Text>
            <Text style={styles.welcomeHeading}>Where are you traveling?</Text>
            <Text style={styles.welcomeSub}>
              Type any query below like "Varanasi to Gopiganj nice resturent" or "Delhi to Jaipur best dhabas".
            </Text>
          </View>
        ) : null}

        {messages.map((item) =>
          item.sender === 'user' ? (
            <View key={item.id} style={styles.userBubbleWrapper}>
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleLabel}>YOU</Text>
                <Text style={styles.userBubbleText}>{item.text}</Text>
              </View>
            </View>
          ) : (
            <View key={item.id} style={styles.aiBubbleWrapper}>
              <View style={styles.aiBubble}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>✨ Route Advice</Text>
                </View>
                <Text style={styles.aiBubbleText}>{item.text}</Text>

                {/* Plot on Map Action Button */}
                {item.routeData && (
                  <TouchableOpacity
                    style={styles.plotButton}
                    onPress={() => handlePlotOnMap(item.routeData)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.plotButtonText}>
                      📍 Plot Route: {item.routeData.origin} ➔ {item.routeData.destination}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        )}

        {loadingAI ? (
          <View style={styles.aiBubbleWrapper}>
            <View style={styles.aiBubble}>
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#1D4ED8" />
                <Text style={styles.loadingText}>Analyzing route & pitstops...</Text>
              </View>
            </View>
          </View>
        ) : null}

        {isTyping && streamingText ? (
          <View style={styles.aiBubbleWrapper}>
            <View style={styles.aiBubble}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>✨ Route Advice</Text>
              </View>
              <Text style={styles.aiBubbleText}>
                {streamingText}
                <Text style={styles.cursor}> ▍</Text>
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Sticky Input Bar */}
      <View style={styles.bottomBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask route, food stops, conditions..."
          placeholderTextColor="#94A3B8"
          value={aiQuestion}
          onChangeText={setAiQuestion}
          onSubmitEditing={handleAskAI}
          editable={!loadingAI && !isTyping}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!aiQuestion.trim() || loadingAI || isTyping) && styles.sendButtonDisabled]}
          onPress={handleAskAI}
          disabled={!aiQuestion.trim() || loadingAI || isTyping}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>Ask</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  clearBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  welcomeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  welcomeHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  userBubbleWrapper: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: '85%',
  },
  userBubbleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 2,
  },
  userBubbleText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 20,
  },
  aiBubbleWrapper: {
    alignItems: 'flex-start',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    maxWidth: '96%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  aiBadgeText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  aiBubbleText: {
    fontSize: 13.5,
    lineHeight: 22,
    color: '#334155',
  },
  plotButton: {
    marginTop: 14,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  plotButtonText: {
    color: '#1D4ED8',
    fontSize: 12.5,
    fontWeight: '700',
  },
  cursor: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  sendButton: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default ExploreScreen;