
export default {
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    confirm: "Confirmar",
    back: "Volver",
    close: "Cerrar",
    or: "O",
    unknownUser: "Usuario Desconocido"
  },
  auth: {
    signIn: {
      title: "Iniciar Sesión",
      subtitle: "Noche de películas resuelta.",
      button: "Entrar",
      google: "Continuar con Google",
      forgotPassword: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes cuenta?",
      signUpLink: "Regístrate"
    },
    signUp: {
      title: "Crear Cuenta",
      subtitle: "Únete al club.",
      button: "Crear Cuenta",
      alreadyHaveAccount: "¿Ya tienes cuenta?",
      signInLink: "Iniciar Sesión",
      passwordStrength: {
        weak: "Débil",
        medium: "Medio",
        strong: "Fuerte"
      }
    },
    fields: {
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      displayName: "Nombre para Mostrar"
    },
    errors: {
      fillAll: "Por favor completa todos los campos.",
      passwordMatch: "Las contraseñas no coinciden.",
      passwordWeak: "La contraseña no es lo suficientemente fuerte.",
      invalidEmail: "Introduce un correo válido.",
      userNotFound: "No se encontró cuenta con este correo.",
      wrongPassword: "Contraseña incorrecta."
    }
  },
  groups: {
    dashboard: {
      title: "Mis Grupos",
      createButton: "Crear Nuevo Grupo",
      emptyState: {
        title: "Tu equipo de cine te espera",
        subtitle: "Inicia tu primer grupo para resolver los debates de películas. 🍿"
      }
    },
    card: {
      members: "{{count}} miembro",
      members_plural: "{{count}} miembros",
      movies: "{{count}} película",
      movies_plural: "{{count}} películas",
      lastActive: "Activo: {{time}}"
    },
    create: {
      title: "Crear Nuevo Grupo",
      nameLabel: "Nombre del Grupo",
      placeholder: "ej. Noche de Cine",
      colorLabel: "Color del Grupo",
      submit: "Crear Grupo"
    },
    join: {
      title: "Unirse a Grupo",
      subtitle: "Ingresa el código de 6 caracteres.",
      placeholder: "ABC123",
      button: "Unirse",
      invitedTo: "Te han invitado a unirte a:",
      backButton: "Volver a mis grupos"
    },
    details: {
      tabs: {
        watchlist: "Lista",
        members: "Miembros"
      },
      spinButton: "Girar Ruleta",
      historyButton: "Historial",
      inviteButton: "Invitar Amigos",
      emptyWatchlist: {
        title: "No hay películas pendientes",
        subtitle: "¡Agrega una película para comenzar!"
      }
    },
    members: {
      title: "Miembros ({{count}})",
      ownerBadge: "Dueño",
      remove: "Eliminar Miembro",
      leave: "Salir del Grupo"
    }
  },
  movies: {
    add: {
      button: "Agregar Película",
      title: "Agregar Películas",
      placeholder: "Buscar película...",
      tabs: {
        popular: "🔥 Populares",
        browse: "🔭 Explorar",
        search: "🔍 Resultados"
      },
      categories: {
        trending: "🔥 Tendencia Hoy",
        topRated: "⭐ Mejor Valoradas",
        nowPlaying: "🎬 En Cines"
      }
    },
    card: {
      addedBy: "Agregado por {{name}}",
      deleteConfirm: {
        title: "¿Eliminar película?",
        description: "Esto eliminará permanentemente \"{{title}}\" de la lista.",
        button: "Eliminar"
      }
    },
    opinions: {
      mustWatch: "Hay que verla",
      seen: "Ya vista",
      pass: "Paso"
    },
    preview: {
      addToWatchlist: "+ Agregar a la Lista",
      added: "✓ Agregada",
      watchTrailer: "Ver Tráiler 🎬"
    }
  },
  roulette: {
    title: "Ruleta de Cine",
    spinButton: "¡Girar Ruleta!",
    spinning: "Girando...",
    emptyTitle: "¡La Ruleta está vacía!",
    emptySubtitle: "Agrega películas a la lista para comenzar.",
    filters: {
      mustWatch: "🌟 Hay que verla",
      all: "🎬 Todas",
      mustWatchSeen: "🌟✅ Must + Vista",
      mustWatchPass: "🌟👎 Must + Paso"
    },
    result: {
      title: "¡VAMOS A VER ESTA!",
      markWatched: "✓ Marcar como Vista",
      spinAgain: "Girar de Nuevo",
      back: "Volver"
    }
  },
  history: {
    title: "Historial",
    subtitle: "{{count}} película vista",
    subtitle_plural: "{{count}} películas vistas",
    filter: {
      label: "Filtro:",
      all: "Todo",
      month: "Mes",
      year: "Año"
    },
    sort: {
      label: "Ordenar:",
      recent: "Reciente",
      rating: "Valoración"
    },
    stats: {
      total: "Películas Vistas",
      avgRating: "Valoración Prom.",
      genre: "Género Favorito",
      contributor: "Mayor Contribuidor"
    },
    card: {
      watchedOn: "Vista el {{date}}",
      yourRating: "Tu calificación:",
      comments: {
        show: "Ver Comentarios",
        hide: "Ocultar Comentarios",
        placeholder: "Escribe un comentario...",
        post: "Publicar",
        empty: "¡Sé el primero en comentar!"
      },
      unwatch: {
        button: "Desmarcar",
        title: "¿Desmarcar como vista?",
        description: "Esto moverá \"{{title}}\" de regreso a la lista de pendientes.",
        confirm: "Mover a Lista"
      }
    }
  },
  settings: {
    title: "Configuración",
    backProfile: "Volver a Perfil",
    password: {
      title: "Cambiar Contraseña",
      current: "Contraseña Actual",
      new: "Nueva Contraseña",
      confirm: "Confirmar Nueva",
      update: "Actualizar",
      googleAccount: "Has iniciado sesión con Google. La gestión de contraseña se realiza en Google."
    },
    language: {
      title: "Idioma",
      label: "Idioma de la App"
    }
  }
};
