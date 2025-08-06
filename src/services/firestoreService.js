import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Coleções do Firestore
const COLLECTIONS = {
  RIDE_REQUESTS: 'rideRequests',
  USERS: 'users',
  DRIVERS: 'drivers'
};

// Serviço para Solicitações de Corrida
export const rideRequestService = {
  // Criar nova solicitação de corrida
  async create(rideData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.RIDE_REQUESTS), {
        ...rideData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      throw error;
    }
  },

  // Atualizar solicitação existente
  async update(requestId, updateData) {
    try {
      const docRef = doc(db, COLLECTIONS.RIDE_REQUESTS, requestId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      throw error;
    }
  },

  // Deletar solicitação
  async delete(requestId) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.RIDE_REQUESTS, requestId));
    } catch (error) {
      console.error('Erro ao deletar solicitação:', error);
      throw error;
    }
  },

  // Buscar solicitações por motorista
  async getByDriver(driverId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.RIDE_REQUESTS),
        where('driverId', '==', driverId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar solicitações do motorista:', error);
      throw error;
    }
  },

  // Buscar solicitações por usuário
  async getByUser(userId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.RIDE_REQUESTS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar solicitações do usuário:', error);
      throw error;
    }
  },

  // Escutar mudanças em tempo real para um motorista
  onDriverRequestsChange(driverId, callback) {
    const q = query(
      collection(db, COLLECTIONS.RIDE_REQUESTS),
      where('driverId', '==', driverId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(requests);
    });
  },

  // Escutar mudanças em tempo real para um usuário
  onUserRequestsChange(userId, callback) {
    const q = query(
      collection(db, COLLECTIONS.RIDE_REQUESTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(requests);
    });
  },

  // Escutar todas as solicitações pendentes (para motoristas)
  onPendingRequestsChange(callback) {
    const q = query(
      collection(db, COLLECTIONS.RIDE_REQUESTS),
      where('status', 'in', ['pending', 'waitingPrice']),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(requests);
    });
  }
};

// Serviço para Usuários
export const userService = {
  async create(userData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...userData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  async update(userId, updateData) {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
};

// Serviço para Motoristas
export const driverService = {
  async create(driverData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.DRIVERS), {
        ...driverData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar motorista:', error);
      throw error;
    }
  },

  async update(driverId, updateData) {
    try {
      const docRef = doc(db, COLLECTIONS.DRIVERS, driverId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar motorista:', error);
      throw error;
    }
  },

  // Buscar motoristas disponíveis
  async getAvailable() {
    try {
      const q = query(
        collection(db, COLLECTIONS.DRIVERS),
        where('available', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar motoristas disponíveis:', error);
      throw error;
    }
  }
};

