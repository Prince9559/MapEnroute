import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useToast } from '../../context/ToastContext';
import { askRouteAI } from '../../api/aiApi';

const ExploreScreen = () => {
  const { showToast } = useToast();
  const [aiQuestion, setAiQuestion] = useState('');
  const [fullResponse, setFullResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimerRef = useRef(null);

  // Smooth typewriter streaming
  useEffect(() => {
    if (!fullResponse) {
      setDisplayedResponse('');
      return;
    }

    const words = fullResponse.trim().split(/\s+/);
    let index = 0;
    setDisplayedResponse('');
    setIsTyping(true);

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      if (index < words.length) {
        const nextWord = words[index];
        setDisplayedResponse((prev) => (prev ? `${prev} ${nextWord}` : nextWord));
        index++;
      } else {
        clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, 35);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [fullResponse]);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) {
      showToast('Please type a travel query first.', 'error');
      return;
    }

    setLoadingAI(true);
    setFullResponse('');
    setDisplayedResponse('');

    try {
      const answer = await askRouteAI(aiQuestion.trim());
      setFullResponse(answer);
    } catch (err) {
      showToast('Could not fetch AI insights right now.', 'error');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore & Plan</Text>
        <Text style={styles.subtitle}>Ask anything about Indian routes, cafes, and highways</Text>
      </View>

      <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <Text style={styles.aiIcon}>✨</Text>
          <View>
            <Text style={styles.aiTitle}>Smart Route Assistant</Text>
            <Text style={styles.aiSubtitle}>Ask about food stops, tolls, or road conditions</Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.aiInput}
            placeholder="e.g. Varanasi to Gyanpur nice restaurant"
            placeholderTextColor="#94A3B8"
            value={aiQuestion}
            onChangeText={setAiQuestion}
            onSubmitEditing={handleAskAI}
          />
          <TouchableOpacity
            style={styles.askButton}
            onPress={handleAskAI}
            disabled={loadingAI || isTyping}
            activeOpacity={0.8}
          >
            {loadingAI ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.askButtonText}>Ask</Text>
            )}
          </TouchableOpacity>
        </View>

        {(loadingAI || displayedResponse) ? (
          <View style={styles.responseBox}>
            <View style={styles.responseBadge}>
              <Text style={styles.responseBadgeText}>
                {loadingAI ? 'Thinking...' : isTyping ? 'Generating...' : '✨ AI Route Advice'}
              </Text>
            </View>
            <Text style={styles.responseText}>
              {displayedResponse}
              {isTyping ? ' ▍' : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#1E40AF',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  aiIcon: {
    fontSize: 26,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  aiInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1E293B',
  },
  askButton: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  responseBox: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  responseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  responseBadgeText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  responseText: {
    fontSize: 13.5,
    lineHeight: 22,
    color: '#1E293B',
    fontWeight: '400',
  },
});

export default ExploreScreen;