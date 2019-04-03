package org.shanoir.ng.shared.security;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.keycloak.KeycloakPrincipal;
import org.shanoir.ng.shared.core.model.AbstractEntity;
import org.shanoir.ng.shared.error.FieldError;
import org.shanoir.ng.shared.error.FieldErrorMap;
import org.shanoir.ng.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Validator for edition by role.
 * 
 * @author msimon
 *
 * @param <T>
 */
@Service
public abstract class FieldEditionSecurityManagerImpl <T extends AbstractEntity> implements FieldEditionSecurityManager<T> {
	
	@Autowired
	public CrudRepository<T, Long> repository;

	@Override
	public FieldErrorMap validate(final T entity) {
		if (entity.getId() == null) {
			return validateCreate(entity);
		} else {
			T originalEntity = repository.findOne(entity.getId());
			return validateUpdate(entity, originalEntity);
		}		
	}
	
	
	private FieldErrorMap validateUpdate(final T editedEntity, final T originalEntity) {

		final Collection<String> connectedUserRoles = getConnectedUserRoles();
		final FieldErrorMap errorMap = new FieldErrorMap();
		for (final Field field : originalEntity.getClass().getDeclaredFields()) {
			if (field.isAnnotationPresent(EditableOnlyBy.class)) {
				final EditableOnlyBy annotation = field.getAnnotation(EditableOnlyBy.class);
				final String getterName = "get" + StringUtils.capitalize(field.getName());
				try {
					final Method originalGetter = originalEntity.getClass().getMethod(getterName);
					final Method editedGetter = editedEntity.getClass().getMethod(getterName);
					final Object originalValue = originalGetter.invoke(originalEntity);
					final Object givenValue = editedGetter.invoke(editedEntity);
					final boolean fieldHasBeenModified = !Utils.equalsIgnoreNull(originalValue, givenValue);
					if (fieldHasBeenModified && !haveOneRoleInCommon(annotation.roles(), connectedUserRoles)) {
						final List<FieldError> errors = new ArrayList<FieldError>();
						errors.add(new FieldError("unauthorized", "You do not have the right to edit this field",
								givenValue));
						errorMap.put(field.getName(), errors);
					}
				} catch (IllegalArgumentException | IllegalAccessException | InvocationTargetException e) {
					throw new IllegalStateException("Error while checking @EditableOnlyBy custom annotation", e);
				} catch (NoSuchMethodException e) {
					throw new IllegalStateException(
							"Error while checking @EditableOnlyBy custom annotation, you must implement a method named "
									+ getterName + "() for accessing " + originalEntity.getClass().getName() + "."
									+ field.getName());
				}
			}
		}
		return errorMap;
	}

	/**
	 * Validates a creation
	 *
	 * @param user
	 * @return the forgotten fields names
	 */
	private FieldErrorMap validateCreate(final T editedEntity) {
		final Collection<String> connectedUserRoles = getConnectedUserRoles();
		final FieldErrorMap errorMap = new FieldErrorMap();
		for (final Field field : editedEntity.getClass().getDeclaredFields()) {
			if (field.isAnnotationPresent(EditableOnlyBy.class)) {
				final EditableOnlyBy annotation = field.getAnnotation(EditableOnlyBy.class);
				final String getterName = "get" + StringUtils.capitalize(field.getName());
				try {
					final Method editedGetter = editedEntity.getClass().getMethod(getterName);
					final Object givenValue = editedGetter.invoke(editedEntity);
					if (givenValue != null && !haveOneRoleInCommon(annotation.roles(), connectedUserRoles)) {
						final List<FieldError> errors = new ArrayList<FieldError>();
						errors.add(new FieldError("unauthorized", "You do not have the right to edit this field",
								givenValue));
						errorMap.put(field.getName(), errors);
					}
				} catch (IllegalArgumentException | IllegalAccessException | InvocationTargetException e) {
					throw new IllegalStateException("Error while checking @EditableOnlyBy custom annotation", e);
				} catch (NoSuchMethodException e) {
					throw new IllegalStateException(
							"Error while checking @EditableOnlyBy custom annotation, you must implement a method named "
									+ getterName + "() for accessing " + editedEntity.getClass().getName() + "."
									+ field.getName());
				}
			}
		}
		return errorMap;
	}

	private static boolean haveOneRoleInCommon(final String[] roles, final Collection<String> authorities) {
		for (final String role : roles) {
			for (final String authority : authorities) {
				if (role != null && role.equals(authority)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Get connected user roles. If anonymous user, returns an empty list.
	 * 
	 * @return roles
	 */
	@SuppressWarnings("rawtypes")
	private static Collection<String> getConnectedUserRoles() {
		if (SecurityContextHolder.getContext().getAuthentication() instanceof AnonymousAuthenticationToken) {
			return new ArrayList<String>();
		} else {
			final Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			if (principal == null) {
				throw new IllegalArgumentException("connectedUser cannot be null");
			}
			if (principal instanceof User) {
				final List<String> userRoles = new ArrayList<String>();
				for (GrantedAuthority authority : ((User) principal).getAuthorities()) {
					userRoles.add(authority.getAuthority());
				}
				return userRoles;
			}
			return ((KeycloakPrincipal) principal).getKeycloakSecurityContext().getToken().getRealmAccess().getRoles();
		}
	}

}
