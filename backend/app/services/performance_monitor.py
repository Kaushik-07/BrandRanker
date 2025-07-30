import time
import threading
from typing import Dict, Any, Optional
from collections import defaultdict, deque
import psutil
import os


class PerformanceMonitor:
    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.rate_limit_hits = 0
        self.fallback_usage = defaultdict(int)
        self.cache_size = 0
        self.rate_limit_remaining = 50
        self.request_times = deque(maxlen=1000)  # Store last 1000 request times
        self.error_times = deque(maxlen=100)     # Store last 100 error times
        self.api_response_times = defaultdict(list)  # Track API response times
        self.lock = threading.Lock()
        
        # System metrics
        self.start_time = time.time()
        self.last_metrics_time = time.time()
        
        # Performance thresholds
        self.slow_request_threshold = 5.0  # seconds
        self.error_rate_threshold = 0.1    # 10%
        self.cache_hit_rate_threshold = 0.5  # 50%
        
    def track_request(self, func):
        """Decorator to track function performance"""
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                self._record_successful_request(time.time() - start_time)
                return result
            except Exception as e:
                self._record_failed_request(time.time() - start_time, str(e))
                raise
        return wrapper
    
    def _record_successful_request(self, duration: float):
        """Record a successful request"""
        with self.lock:
            self.request_count += 1
            self.request_times.append(duration)
            
            # Track slow requests
            if duration > self.slow_request_threshold:
                print(f"⚠️ Slow request detected: {duration:.2f}s")
    
    def _record_failed_request(self, duration: float, error: str):
        """Record a failed request"""
        with self.lock:
            self.request_count += 1
            self.error_count += 1
            self.error_times.append(time.time())
            print(f"❌ Request failed after {duration:.2f}s: {error}")
    
    def track_cache_hit(self):
        """Track a cache hit"""
        with self.lock:
            self.cache_hits += 1
    
    def track_cache_miss(self):
        """Track a cache miss"""
        with self.lock:
            self.cache_misses += 1
    
    def track_rate_limit_hit(self):
        """Track a rate limit hit"""
        with self.lock:
            self.rate_limit_hits += 1
    
    def update_cache_size(self, size: int):
        """Update cache size metric"""
        with self.lock:
            self.cache_size = size
    
    def update_rate_limit_remaining(self, remaining: int):
        """Update rate limit remaining"""
        with self.lock:
            self.rate_limit_remaining = remaining
    
    def track_fallback_usage(self, source: str):
        """Track fallback usage by source"""
        with self.lock:
            self.fallback_usage[source] += 1
    
    def track_api_response_time(self, api_name: str, duration: float):
        """Track API response time"""
        with self.lock:
            self.api_response_times[api_name].append(duration)
            # Keep only last 100 response times per API
            if len(self.api_response_times[api_name]) > 100:
                self.api_response_times[api_name] = self.api_response_times[api_name][-100:]
    
    def track_error(self, operation: str, error_message: str) -> None:
        """Track errors for monitoring"""
        with self.lock:
            self.error_count += 1
            self.error_times.append(time.time())
            print(f"❌ Error in {operation}: {error_message}")
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get comprehensive performance statistics"""
        with self.lock:
            current_time = time.time()
            uptime = current_time - self.start_time
            
            # Calculate rates
            total_requests = self.request_count
            error_rate = (self.error_count / max(total_requests, 1)) * 100
            cache_hit_rate = (self.cache_hits / max(self.cache_hits + self.cache_misses, 1)) * 100
            
            # Calculate average response time
            avg_response_time = 0
            if self.request_times:
                avg_response_time = sum(self.request_times) / len(self.request_times)
            
            # Calculate recent error rate (last 10 minutes)
            recent_errors = sum(1 for error_time in self.error_times 
                              if current_time - error_time < 600)
            recent_error_rate = (recent_errors / max(len([t for t in self.request_times 
                                                        if current_time - t < 600]), 1)) * 100
            
            # System metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # API performance metrics
            api_performance = {}
            for api_name, response_times in self.api_response_times.items():
                if response_times:
                    api_performance[api_name] = {
                        'avg_response_time': sum(response_times) / len(response_times),
                        'min_response_time': min(response_times),
                        'max_response_time': max(response_times),
                        'total_requests': len(response_times)
                    }
            
            return {
                'uptime': {
                    'seconds': uptime,
                    'formatted': self._format_uptime(uptime)
                },
                'requests': {
                    'total': total_requests,
                    'errors': self.error_count,
                    'error_rate': error_rate,
                    'recent_error_rate': recent_error_rate,
                    'avg_response_time': avg_response_time,
                    'slow_requests': len([t for t in self.request_times if t > self.slow_request_threshold])
                },
                'cache': {
                    'hits': self.cache_hits,
                    'misses': self.cache_misses,
                    'hit_rate': cache_hit_rate,
                    'size': self.cache_size
                },
                'rate_limiting': {
                    'hits': self.rate_limit_hits,
                    'remaining': self.rate_limit_remaining
                },
                'fallback_usage': dict(self.fallback_usage),
                'api_performance': api_performance,
                'system': {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'memory_available': memory.available,
                    'disk_percent': disk.percent,
                    'disk_free': disk.free
                },
                'health': {
                    'status': self._get_health_status(error_rate, cache_hit_rate, recent_error_rate),
                    'issues': self._get_health_issues(error_rate, cache_hit_rate, recent_error_rate, cpu_percent)
                }
            }
    
    def _format_uptime(self, seconds: float) -> str:
        """Format uptime in human readable format"""
        days = int(seconds // 86400)
        hours = int((seconds % 86400) // 3600)
        minutes = int((seconds % 3600) // 60)
        seconds = int(seconds % 60)
        
        if days > 0:
            return f"{days}d {hours}h {minutes}m {seconds}s"
        elif hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"
    
    def _get_health_status(self, error_rate: float, cache_hit_rate: float, recent_error_rate: float) -> str:
        """Determine overall health status"""
        if error_rate > 20 or recent_error_rate > 30:
            return "critical"
        elif error_rate > 10 or recent_error_rate > 15:
            return "degraded"
        elif cache_hit_rate < 30:
            return "warning"
        else:
            return "healthy"
    
    def _get_health_issues(self, error_rate: float, cache_hit_rate: float, 
                          recent_error_rate: float, cpu_percent: float) -> list:
        """Get list of health issues"""
        issues = []
        
        if error_rate > 10:
            issues.append(f"High error rate: {error_rate:.1f}%")
        
        if recent_error_rate > 15:
            issues.append(f"Recent error rate: {recent_error_rate:.1f}%")
        
        if cache_hit_rate < 50:
            issues.append(f"Low cache hit rate: {cache_hit_rate:.1f}%")
        
        if cpu_percent > 80:
            issues.append(f"High CPU usage: {cpu_percent:.1f}%")
        
        if self.rate_limit_hits > 10:
            issues.append(f"Rate limit hits: {self.rate_limit_hits}")
        
        return issues
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get system health status"""
        stats = self.get_performance_stats()
        
        return {
            'status': stats['health']['status'],
            'issues': stats['health']['issues'],
            'metrics': {
                'uptime': stats['uptime']['formatted'],
                'error_rate': stats['requests']['error_rate'],
                'cache_hit_rate': stats['cache']['hit_rate'],
                'cpu_percent': stats['system']['cpu_percent'],
                'memory_percent': stats['system']['memory_percent']
            }
        }
    
    def reset_metrics(self):
        """Reset all metrics (useful for testing)"""
        with self.lock:
            self.request_count = 0
            self.error_count = 0
            self.cache_hits = 0
            self.cache_misses = 0
            self.rate_limit_hits = 0
            self.fallback_usage.clear()
            self.request_times.clear()
            self.error_times.clear()
            self.api_response_times.clear()
            self.start_time = time.time()


# Global instance
performance_monitor = PerformanceMonitor() 