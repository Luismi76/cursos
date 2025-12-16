package com.infocurso.backend.exception;

import com.infocurso.backend.dto.ErrorDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorDTO> handleResourceNotFoundException(ResourceNotFoundException ex,
                        HttpServletRequest request) {
                ErrorDTO error = ErrorDTO.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.NOT_FOUND.value())
                                .error("Not Found")
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .build();
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorDTO> handleValidationException(MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                String detail = ex.getBindingResult().getFieldError() != null
                                ? ex.getBindingResult().getFieldError().getDefaultMessage()
                                : "Validation Error";

                ErrorDTO error = ErrorDTO.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error("Validation Error")
                                .message(detail)
                                .path(request.getRequestURI())
                                .build();
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ErrorDTO> handleBadCredentialsException(BadCredentialsException ex,
                        HttpServletRequest request) {
                ErrorDTO error = ErrorDTO.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.UNAUTHORIZED.value())
                                .error("Unauthorized")
                                .message("Credenciales inválidas")
                                .path(request.getRequestURI())
                                .build();
                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorDTO> handleAccessDeniedException(AccessDeniedException ex,
                        HttpServletRequest request) {
                ErrorDTO error = ErrorDTO.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.FORBIDDEN.value())
                                .error("Forbidden")
                                .message("No tienes permisos para acceder a este recurso")
                                .path(request.getRequestURI())
                                .build();
                return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler(Exception.class)

        public ResponseEntity<ErrorDTO> handleGlobalException(Exception ex, HttpServletRequest request) {
                ex.printStackTrace(); // Log the error
                ErrorDTO error = ErrorDTO.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .error("Internal Server Error")
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .build();
                return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
