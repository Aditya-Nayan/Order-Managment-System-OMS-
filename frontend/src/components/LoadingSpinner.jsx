function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 rounded-full border-3 border-gray-200 border-t-blue-600 animate-spin" style={{ borderWidth: '3px' }} />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
