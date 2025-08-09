import requests
import json
from typing import List, Dict, Tuple, Optional

class OSRMRoutingService:
    """Serviço para calcular rotas usando OSRM (Open Source Routing Machine)"""
    
    def __init__(self, osrm_url: str = "http://router.project-osrm.org"):
        """
        Inicializa o serviço de roteamento
        
        Args:
            osrm_url: URL do servidor OSRM (padrão: servidor público)
        """
        self.osrm_url = osrm_url.rstrip('/')
    
    def calculate_route(self, coordinates: List[Tuple[float, float]], 
                       profile: str = "driving") -> Optional[Dict]:
        """
        Calcula a rota entre múltiplos pontos
        
        Args:
            coordinates: Lista de tuplas (longitude, latitude)
            profile: Perfil de roteamento (driving, walking, cycling)
            
        Returns:
            Dicionário com informações da rota ou None se erro
        """
        try:
            # Formatar coordenadas para OSRM (longitude,latitude)
            coords_str = ";".join([f"{lng},{lat}" for lng, lat in coordinates])
            
            # URL da API OSRM
            url = f"{self.osrm_url}/route/v1/{profile}/{coords_str}"
            
            # Parâmetros da requisição
            params = {
                "overview": "full",
                "geometries": "geojson",
                "steps": "true"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                
                return {
                    "distance": route.get("distance", 0),  # metros
                    "duration": route.get("duration", 0),  # segundos
                    "geometry": route.get("geometry"),
                    "legs": route.get("legs", []),
                    "waypoints": data.get("waypoints", [])
                }
            else:
                print(f"Erro OSRM: {data.get('message', 'Erro desconhecido')}")
                return None
                
        except requests.RequestException as e:
            print(f"Erro na requisição OSRM: {e}")
            return None
        except Exception as e:
            print(f"Erro inesperado: {e}")
            return None
    
    def calculate_distance_matrix(self, coordinates: List[Tuple[float, float]], 
                                 profile: str = "driving") -> Optional[Dict]:
        """
        Calcula matriz de distâncias entre múltiplos pontos
        
        Args:
            coordinates: Lista de tuplas (longitude, latitude)
            profile: Perfil de roteamento
            
        Returns:
            Dicionário com matriz de distâncias ou None se erro
        """
        try:
            coords_str = ";".join([f"{lng},{lat}" for lng, lat in coordinates])
            url = f"{self.osrm_url}/table/v1/{profile}/{coords_str}"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == "Ok":
                return {
                    "distances": data.get("distances", []),
                    "durations": data.get("durations", [])
                }
            else:
                print(f"Erro OSRM: {data.get('message', 'Erro desconhecido')}")
                return None
                
        except requests.RequestException as e:
            print(f"Erro na requisição OSRM: {e}")
            return None
        except Exception as e:
            print(f"Erro inesperado: {e}")
            return None
    
    def get_nearest_road(self, latitude: float, longitude: float, 
                        profile: str = "driving") -> Optional[Dict]:
        """
        Encontra o ponto mais próximo na rede rodoviária
        
        Args:
            latitude: Latitude do ponto
            longitude: Longitude do ponto
            profile: Perfil de roteamento
            
        Returns:
            Dicionário com informações do ponto mais próximo
        """
        try:
            url = f"{self.osrm_url}/nearest/v1/{profile}/{longitude},{latitude}"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == "Ok" and data.get("waypoints"):
                waypoint = data["waypoints"][0]
                return {
                    "latitude": waypoint["location"][1],
                    "longitude": waypoint["location"][0],
                    "distance": waypoint.get("distance", 0)
                }
            else:
                print(f"Erro OSRM: {data.get('message', 'Erro desconhecido')}")
                return None
                
        except requests.RequestException as e:
            print(f"Erro na requisição OSRM: {e}")
            return None
        except Exception as e:
            print(f"Erro inesperado: {e}")
            return None

def format_distance(distance_meters: float) -> str:
    """
    Formata distância em metros para string legível
    
    Args:
        distance_meters: Distância em metros
        
    Returns:
        String formatada (ex: "1.2 km" ou "500 m")
    """
    if distance_meters >= 1000:
        return f"{distance_meters / 1000:.1f} km"
    else:
        return f"{int(distance_meters)} m"

def format_duration(duration_seconds: float) -> str:
    """
    Formata duração em segundos para string legível
    
    Args:
        duration_seconds: Duração em segundos
        
    Returns:
        String formatada (ex: "1h 30min" ou "45min")
    """
    hours = int(duration_seconds // 3600)
    minutes = int((duration_seconds % 3600) // 60)
    
    if hours > 0:
        return f"{hours}h {minutes}min"
    else:
        return f"{minutes}min"

