package org.shanoir.ng.utils;

import java.util.ArrayList;
import java.util.List;

import org.shanoir.ng.shared.core.model.AbstractEntity;

/**
 * Utility class
 *
 * @author jlouis
 */
public class Utils {

	/**
	 * Convert Iterable to List
	 *
	 * @param iterable
	 * @return a list
	 */
	public static <E> List<E> toList(Iterable<E> iterable) {
		if (iterable instanceof List) {
			return (List<E>) iterable;
		}
		ArrayList<E> list = new ArrayList<E>();
		if (iterable != null) {
			for (E e : iterable) {
				list.add(e);
			}
		}
		return list;
	}

	public static boolean equalsIgnoreNull(Object o1, Object o2) {
		if (o1 == null)
			return o2 == null;
		if (o2 == null)
			return o1 == null;
		if (o1 instanceof AbstractEntity && o2 instanceof AbstractEntity) {
			return ((AbstractEntity) o1).getId().equals(((AbstractEntity) o2).getId());
		}
		return o1.equals(o2) || o2.equals(o1);
		// o1.equals(o2) is not equivalent to o2.equals(o1) ! For instance with
		// java.sql.Timestamp and java.util.Date
	}
	
	public static <T> List<T> copyList(List<T> list) {
    	List<T> copy = new ArrayList<T>();
    	for (T item : list) copy.add(item);
    	return copy;
    }

	
	public static void removeIdsFromList(Iterable<Long> ids, List<? extends AbstractEntity> list) {
		for (Long id : ids) {
			int deletedIndex = -1;
			int i = 0;
			for (AbstractEntity entity : list) {
				if (id.equals(entity.getId())) {
					deletedIndex = i;
					break;
				}
				i++;
			}
			if (deletedIndex > -1) list.remove(deletedIndex);
		}
	}
	
	
	public static boolean haveOneInCommon(final Iterable<String> roles, final Iterable<String> authorities) {
		for (final String role : roles) {
			for (final String authority : authorities) {
				if (role != null && role.equals(authority)) {
					return true;
				}
			}
		}
		return false;
	}
}
