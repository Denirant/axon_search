import { useState, useRef } from "react";
import {
  Search,
  User,
  Upload,
  X,
  Check,
  ExternalLink,
  ChevronRight
} from "lucide-react";

const UserSettingsDialog = ({ isOpen, onClose, currentUser }) => {
  const [activeSection, setActiveSection] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  
  // User profile data
  const [displayName, setDisplayName] = useState(currentUser.name || "Michael Aspinwall");
  const [role, setRole] = useState(currentUser.role || "Skylight Agent");
  const [avatarPreview, setAvatarPreview] = useState(currentUser.image || null);

  // Connected services
  const connections = [
    { 
      id: "chatgpt", 
      name: "ChatGPT", 
      description: "Creating safe AGI that benefits all of humanity.",
      isConnected: false,
      icon: "https://api.iconify.design/logos:openai-icon.svg"
    },
    { 
      id: "notion", 
      name: "Notion", 
      description: "Create notes around your workspaces.",
      isConnected: false,
      icon: "https://api.iconify.design/logos:notion-icon.svg"
    },
    { 
      id: "dropbox", 
      name: "Dropbox", 
      description: "Share and store files around your employees.",
      isConnected: true,
      icon: "https://api.iconify.design/logos:dropbox.svg"
    },
    { 
      id: "discord", 
      name: "Discord", 
      description: "Company wide video/-text communication.",
      isConnected: false,
      icon: "https://api.iconify.design/logos:discord-icon.svg"
    },
    { 
      id: "screenflow", 
      name: "Screenflow", 
      description: "Record your finding and share it with your team.",
      isConnected: true,
      icon: "https://api.iconify.design/ant-design:video-camera-filled.svg" 
    },
    { 
      id: "raycast", 
      name: "Raycast", 
      description: "Complete tasks, calculate, share common links, and much more.",
      isConnected: false,
      icon: "https://api.iconify.design/simple-icons:raycast.svg"
    }
  ];

  // Navigation items
  const navigationSections = [
    {
      title: "General",
      items: [
        { id: "appearance", icon: "palette", label: "Appearance" },
        { id: "connections", icon: "link", label: "Connections" },
        { id: "time-zones", icon: "clock", label: "Time Zones" },
        { id: "about", icon: "info", label: "About" },
        { id: "notifications", icon: "bell", label: "Notifications" }
      ]
    },
    {
      title: "My Team",
      items: [
        { id: "user-management", icon: "users", label: "User Management" },
        { id: "permissions", icon: "shield", label: "Permissions" },
        { id: "authentication", icon: "key", label: "Authentication" },
        { id: "payments", icon: "credit-card", label: "Payments" },
        { id: "security", icon: "lock", label: "Security & Access" },
        { id: "import-export", icon: "download", label: "Import / Export Data" }
      ]
    }
  ];

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter connections based on search query
  const filteredConnections = connections.filter(connection => 
    connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render icon for navigation items
  const renderIcon = (iconName) => {
    switch (iconName) {
      case "palette": return <div className="w-5 h-5 flex items-center justify-center">🎨</div>;
      case "link": return <div className="w-5 h-5 flex items-center justify-center">🔗</div>;
      case "clock": return <div className="w-5 h-5 flex items-center justify-center">🕒</div>;
      case "info": return <div className="w-5 h-5 flex items-center justify-center">ℹ️</div>;
      case "bell": return <div className="w-5 h-5 flex items-center justify-center">🔔</div>;
      case "users": return <div className="w-5 h-5 flex items-center justify-center">👥</div>;
      case "shield": return <div className="w-5 h-5 flex items-center justify-center">🛡️</div>;
      case "key": return <div className="w-5 h-5 flex items-center justify-center">🔑</div>;
      case "credit-card": return <div className="w-5 h-5 flex items-center justify-center">💳</div>;
      case "lock": return <div className="w-5 h-5 flex items-center justify-center">🔒</div>;
      case "download": return <div className="w-5 h-5 flex items-center justify-center">📥</div>;
      default: return <div className="w-5 h-5 flex items-center justify-center">📄</div>;
    }
  };

  if (!isOpen) return null;

  return (
    
  );
};

export default UserSettingsDialog;





      {/* Модальное окно с вкладками профиля и настроек */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'profile' ? 'Профиль пользователя' : 'Настройки'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(v) => setActiveTab(v as 'profile' | 'settings')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://img.freepik.com/free-photo/blue-purple-fluid-background_53876-108681.jpg?semt=ais_hybrid&w=740';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Кнопки действий с аватаром */}
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-full bg-primary text-white shadow-sm hover:bg-primary/90"
                      title="Загрузить фото"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    
                    {avatarPreview && (
                      <button 
                        onClick={removeAvatar}
                        className="p-1.5 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                        title="Удалить фото"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                
                {imageError && (
                  <div className="text-sm text-red-500 dark:text-red-400 text-center">
                    {imageError}
                  </div>
                )}
                
                <div className="w-full max-w-xs">
                  <Label htmlFor="name">Имя</Label>
                  <div className="relative mt-1">
                    <Input 
                      id="name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      className="pl-8"
                      placeholder="Введите ваше имя"
                    />
                    <Pencil className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Кнопки сохранения и отмены */}
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={cancelProfileChanges}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                
                <Button
                  onClick={saveProfileChanges}
                  disabled={isSubmitting || (!displayName && !avatarPreview)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="space-y-6">
                {/* Блок смены темы */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Тема интерфейса</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Выберите предпочитаемую тему оформления
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Светлая
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Темная
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Блок смены пароля */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Изменение пароля</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
                    Вы можете изменить свой пароль для повышения безопасности
                  </p>
                  
                  {passwordChangeStep === 'form' ? (
                    <div className="space-y-3">
                      {/* Текущий пароль */}
                      <div>
                        <Label htmlFor="current-password">Текущий пароль</Label>
                        <div className="relative mt-1">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pl-8 pr-10"
                            placeholder="Введите текущий пароль"
                          />
                          <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Новый пароль */}
                      <div>
                        <Label htmlFor="new-password">Новый пароль</Label>
                        <div className="relative mt-1">
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-8 pr-10"
                            placeholder="Введите новый пароль"
                          />
                          <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {/* Индикатор надежности пароля */}
                        {newPassword && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Надежность пароля:</span>
                              <span className={`font-medium ${
                                passwordStrength.strength === 'weak' ? 'text-red-500' : 
                                passwordStrength.strength === 'medium' ? 'text-yellow-500' : 
                                'text-green-500'
                              }`}>
                                {passwordStrength.strength === 'weak' ? 'Слабый' : 
                                 passwordStrength.strength === 'medium' ? 'Средний' : 
                                 'Надежный'}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${passwordStrength.color} rounded-full`} 
                                style={{ 
                                  width: passwordStrength.strength === 'weak' ? '33%' : 
                                         passwordStrength.strength === 'medium' ? '66%' : '100%' 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Подтверждение пароля */}
                      <div>
                        <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                        <div className="relative mt-1">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-8 pr-10"
                            placeholder="Повторите новый пароль"
                          />
                          <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {/* Валидация совпадения паролей */}
                        {newPassword && confirmPassword && (
                          <div className="flex items-center mt-1 text-xs">
                            {newPassword === confirmPassword ? (
                              <span className="text-green-500 flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Пароли совпадают
                              </span>
                            ) : (
                              <span className="text-red-500">Пароли не совпадают</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Отображение ошибок */}
                      {passwordErrors.length > 0 && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertDescription>
                            <ul className="list-disc pl-5 text-sm">
                              {passwordErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={handlePasswordChange}
                          disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Отправка...
                            </>
                          ) : (
                            'Изменить пароль'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Форма подтверждения кода
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>
                          Код подтверждения отправлен на вашу почту <strong>{user?.email}</strong>. 
                          Введите полученный код для завершения смены пароля.
                        </AlertDescription>
                      </Alert>
                      
                      <div>
                        <Label htmlFor="verification-code">Код подтверждения</Label>
                        <div className="relative mt-1">
                          <Input
                            id="verification-code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="pl-8"
                            placeholder="Введите код из письма"
                            maxLength={6}
                          />
                          <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setPasswordChangeStep('form')}
                          disabled={isChangingPassword}
                        >
                          Назад
                        </Button>
                        
                        <Button
                          onClick={confirmPasswordChange}
                          disabled={isChangingPassword || verificationCode.length < 6}
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Подтверждение...
                            </>
                          ) : (
                            'Подтвердить'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Блок уведомлений */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Уведомления</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Управление настройками уведомлений
                  </p>
                  
                  <div className="mt-3 space-y-2">
                    {/* Здесь могут быть настройки уведомлений */}
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Дополнительные настройки уведомлений будут доступны в ближайшее время.
                    </p>
                  </div>
                </div>
                
                {/* Блок конфиденциальности */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Конфиденциальность</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Настройки приватности и безопасности
                  </p>
                  
                  <div className="mt-3 space-y-2">
                    {/* Здесь могут быть настройки приватности */}
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Дополнительные настройки приватности будут доступны в ближайшее время.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setIsModalOpen(false)}
                >
                  Закрыть
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>