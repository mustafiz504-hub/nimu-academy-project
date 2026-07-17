import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUploadStore } from '../../store/upload.store';

export default function FloatingUploadIndicator() {
  const { tasks, removeTask } = useUploadStore();
  const [expanded, setExpanded] = useState(false);
  
  
  const activeTasks = tasks.filter(t => t.status === 'uploading');
  const errorTasks = tasks.filter(t => t.status === 'error');
  
  const { width, height } = Dimensions.get('window');
  const ICON_WIDTH = 56;
  const ICON_HEIGHT = 56;
  
  // Start at bottom right (using absolute top/left coordinates)
  const pan = useRef(new Animated.ValueXY({ 
    x: width - ICON_WIDTH - 20, 
    y: height - ICON_HEIGHT - 120 
  })).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only intercept if user actually dragged (prevents blocking taps)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        
        let newX = (pan.x as any)._value;
        let newY = (pan.y as any)._value;
        
        // Clamp Y to safe screen bounds (so it doesn't get lost top/bottom)
        if (newY < 50) newY = 50;
        if (newY > height - ICON_HEIGHT - 100) newY = height - ICON_HEIGHT - 100;
        
        // Snap X to nearest left or right edge
        if (newX < width / 2 - ICON_WIDTH / 2) {
          newX = 20; // Snap to left edge
        } else {
          newX = width - ICON_WIDTH - 20; // Snap to right edge
        }
        
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 6,
          tension: 40
        }).start();
      }
    })
  ).current;
  
  if (tasks.length === 0) return null;

  return (
    <>
      <Animated.View 
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          left: pan.x,
          top: pan.y,
          zIndex: 9999,
          elevation: 9999,
        }}
      >
        <TouchableOpacity 
          onPress={() => setExpanded(true)}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 30,
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: '#F1F5F9',
          }}
        >
          <View style={{ position: 'relative', width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0', borderRadius: 18 }}>
          {activeTasks.length > 0 ? (
            <Ionicons name="cloud-upload" size={18} color="#FF8C00" />
          ) : errorTasks.length > 0 ? (
            <Ionicons name="warning" size={18} color="#EF4444" />
          ) : (
            <Ionicons name="checkmark-done" size={18} color="#16A34A" />
          )}
          
          {/* Badge */}
          <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' }}>
            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{tasks.length}</Text>
          </View>
        </View>
      </TouchableOpacity>
      </Animated.View>

      <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E1B18' }}>Uploads ({tasks.length})</Text>
              <TouchableOpacity onPress={() => setExpanded(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ gap: 12 }}>
              {tasks.map(task => (
                <View key={task.id} style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E1B18' }} numberOfLines={1}>{task.filename}</Text>
                      <Text style={{ fontSize: 12, color: task.status === 'error' ? '#EF4444' : '#64748B', marginTop: 2 }}>
                        {task.status === 'uploading' ? `Uploading... ${Math.min(100, task.progress)}%` : task.status === 'completed' ? 'Completed' : task.error || 'Error'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeTask(task.id)}>
                      <Ionicons name="close-circle" size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Progress bar */}
                  <View style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ 
                      width: `${Math.min(100, task.progress)}%`, 
                      height: '100%', 
                      backgroundColor: task.status === 'completed' ? '#16A34A' : task.status === 'error' ? '#EF4444' : '#FF8C00' 
                    }} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
